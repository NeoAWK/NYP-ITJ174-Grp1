const express = require('express');
const router = express.Router();
const db = require('../models');
const { validateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');

// ------------------------------------------------------------------
// Helper: Find course by flexible ID (direct match or padded match)
// ------------------------------------------------------------------
const findCourseById = async (courseId) => {
  // Try exact match first
  let course = await db.Course.findOne({ where: { CourseID: courseId } });
  if (course) return course;

  // Fallback: compare padded versions (e.g., "1" vs "001")
  const all = await db.Course.findAll();
  return all.find(c =>
    String(c.CourseID) === String(courseId) ||
    String(c.CourseID).padStart(3, '0') === String(courseId)
  ) || null;
};

// ------------------------------------------------------------------
// Helper: Format course object with trainer & provider details
// ------------------------------------------------------------------
const formatCourseResponse = async (course, includeTrainerProvider = true) => {
  const plain = course.get({ plain: true });

  let status = plain.SubmissionStatus || 'Pending Review';
  if (status === 'Pending') status = 'Pending Review';

  const result = {
    id: plain.CourseID,
    rawId: plain.CourseID,
    title: plain.CourseTitle || 'Untitled Course',
    level: plain.CourseLevel || 'Foundation',
    category: plain.Category || 'General',
    duration: plain.Duration || 'N/A',
    fee: Number(plain.CourseFee ?? 0),
    TrainerId: plain.TrainerId || null,
    submitted: plain.createdAt
      ? new Date(plain.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '14 Jul 2026',
    status
  };

  // Optionally fetch trainer & provider names (used in GET and after edit)
  if (includeTrainerProvider && plain.TrainerId) {
    const trainerUser = await db.User.findByPk(plain.TrainerId, { attributes: ['name'] });
    result.TrainerName = trainerUser ? trainerUser.name : 'Freelance';

    const profile = await db.TrainerProfile.findOne({
      where: { userId: plain.TrainerId },
      attributes: ['providerId']
    });
    if (profile && profile.providerId) {
      result.ProviderId = profile.providerId;
      const providerUser = await db.User.findByPk(profile.providerId, { attributes: ['name'] });
      result.ProviderName = providerUser ? providerUser.name : 'Unassigned';
    } else {
      result.ProviderId = null;
      result.ProviderName = 'Unassigned';
    }
  } else {
    result.TrainerName = 'Freelance';
    result.ProviderId = null;
    result.ProviderName = 'Unassigned';
  }

  return result;
};

// ------------------------------------------------------------------
// GET /courses  – fetch all courses (with role‑based filtering)
// ------------------------------------------------------------------
router.get('/', validateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const whereClause = {};
    const { id } = req.query;
    if (id) whereClause.CourseID = id;

    // Role‑based filtering
    if (user.usertype === 'RightSkills') {
      // Admin sees all – no extra condition
    } else if (user.usertype === 'Trainer') {
      whereClause.TrainerId = user.id;
    } else if (user.usertype === 'TrainingProvider') {
      const trainerProfiles = await db.TrainerProfile.findAll({
        where: { providerId: user.id },
        attributes: ['userId']
      });
      const trainerIds = trainerProfiles.map(tp => tp.userId);
      if (trainerIds.length === 0) return res.json([]);
      whereClause.TrainerId = { [Op.in]: trainerIds };
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch courses
    const courses = await db.Course.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Format each course (including trainer/provider details)
    const formatted = await Promise.all(
      courses.map(course => formatCourseResponse(course, true))
    );

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// GET /courses/available
router.get('/available', async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      where: {
        IsActive: true,
        SubmissionStatus: 'Approved'
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(courses);
  } catch (err) {
    console.error('Error fetching available courses:', err);
    res.status(500).json({ error: 'Failed to fetch available courses.' });
  }
});

// GET /courses/:id/details – fetch specific course details & modules
router.get('/:id/details', async (req, res) => {
  try {
    const paramId = req.params.id;
    const courseMatch = await findCourseById(paramId);

    if (!courseMatch) {
      return res.status(404).json({ error: 'Course not found in database.' });
    }

    // Attempt include with association, fallback to raw query if model association fails
    let course;
    try {
      course = await db.Course.findOne({
        where: { CourseID: courseMatch.CourseID },
        include: [
          {
            model: db.Module,
            required: false
          }
        ]
      });
    } catch (assocErr) {
      // Direct query fallback if Sequelize association name is not bound
      const coursePlain = courseMatch.get({ plain: true });
      const modules = await db.Module.findAll({
        where: { CourseID: courseMatch.CourseID },
        order: [['OrderSequence', 'ASC']]
      });
      coursePlain.modules = modules;
      return res.json(coursePlain);
    }

    res.json(course);
  } catch (err) {
    console.error('Error fetching course detail:', err);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// ------------------------------------------------------------------
// PUT /courses/:id  – update status (Approved / Rejected / Pending)
// ------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { status, rejectionReason } = req.body;
  const paramId = req.params.id;

  try {
    const course = await findCourseById(paramId);
    if (!course) {
      console.error(`[PUT /courses/${paramId}] Course not found.`);
      return res.status(404).json({ error: 'Course not found in database.' });
    }

    // Normalise status for DB
    const newStatus = status === 'Approved' ? 'Approved'
                   : status === 'Rejected'  ? 'Rejected'
                   : 'Pending';

    // Update SubmissionStatus
    course.SubmissionStatus = newStatus;

    // Handle approval/rejection side effects
    if (newStatus === 'Approved') {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(now.getFullYear() + 3);
      course.ApprovalDate = now;
      course.ApprovalExpiryDate = expiry;
      course.IsActive = true;
    } else if (newStatus === 'Rejected') {
      course.IsActive = false;
      // If you have a RejectionReason column, set it
      if (rejectionReason) course.RejectionReason = rejectionReason;
    }

    await course.save();

    const formatted = await formatCourseResponse(course, true);
    res.json({ message: 'Course status updated successfully.', course: formatted });
  } catch (err) {
    console.error('Error updating course status:', err);
    res.status(500).json({ error: 'Failed to update course status.' });
  }
});

// ------------------------------------------------------------------
// PUT /courses/:id/edit  – full edit (title, level, category, duration, fee)
// ------------------------------------------------------------------
router.put('/:id/edit', validateToken, async (req, res) => {
  const paramId = req.params.id;
  const { title, level, category, duration, fee } = req.body;

  try {
    // 1. Find the course
    const course = await findCourseById(paramId);
    if (!course) {
      console.error(`[PUT /courses/${paramId}/edit] Course not found.`);
      return res.status(404).json({ error: 'Course not found.' });
    }

    // 2. Authorisation
    const user = req.user;
    if (user.usertype !== 'RightSkills' && user.usertype !== 'TrainingProvider') {
      return res.status(403).json({ error: 'Not authorised to edit this course.' });
    }

    if (user.usertype === 'TrainingProvider') {
      const trainerProfile = await db.TrainerProfile.findOne({
        where: { userId: course.TrainerId }
      });
      if (!trainerProfile || trainerProfile.providerId !== user.id) {
        return res.status(403).json({ error: 'You do not own this course.' });
      }
    }

    // 3. Update fields (only if provided)
    if (title !== undefined) course.CourseTitle = title;
    if (level !== undefined) course.CourseLevel = level;
    if (category !== undefined) course.Category = category;
    if (duration !== undefined) course.Duration = duration;
    if (fee !== undefined) course.CourseFee = fee;
    if (course.SubmissionStatus === 'Rejected' && user.usertype === 'TrainingProvider') {
      course.SubmissionStatus = 'Pending';
    }
    await course.save();

    // 4. Return updated course with trainer/provider details
    const formatted = await formatCourseResponse(course, true);
    res.json({ message: 'Course updated successfully.', course: formatted });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

module.exports = router;