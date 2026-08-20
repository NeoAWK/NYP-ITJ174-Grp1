const express = require('express');
const router = express.Router();
const db = require('../models');

// Helper function to map database entries to standard JSON
const formatCourse = (course) => {
  const plain = course.get ? course.get({ plain: true }) : course;
  
  let status = plain.SubmissionStatus || plain.status || 'Pending Review';
  if (status === 'Pending') status = 'Pending Review';

  return {
    id: plain.CourseID || `RS-2026-${String(plain.CourseID || 1).padStart(3, '0')}`,
    rawId: plain.CourseID,
    title: plain.CourseTitle || plain.title || 'Untitled Course',
    level: plain.CourseLevel || plain.level || 'Foundation',
    provider: plain.Provider || plain.provider || plain.TrainingProvider || 'Training Provider',
    category: plain.Category || plain.category || 'General',
    duration: plain.Duration || plain.duration || '20 hours',
    submitted: plain.createdAt 
      ? new Date(plain.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
      : (plain.submitted || '14 Jul 2026'),
    fee: Number(plain.CourseFee ?? plain.fee ?? 0),
    status: status
  };
};

// GET: Fetch all courses
router.get('/', async (req, res) => {
  try {
    const courses = await db.Course.findAll({ order: [['createdAt', 'DESC']] });
    res.json(courses.map(formatCourse));
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// PUT: Update status for a specific course by CourseID
router.put('/:id', async (req, res) => {
  const { status, rejectionReason } = req.body;
  const paramId = req.params.id;

  try {
    // 1. Search DB using CourseID strictly (avoiding non-existent `id` column)
    let course = await db.Course.findOne({
      where: {
        CourseID: paramId
      }
    });

    // 2. Fallback search if the incoming ID doesn't match directly
    if (!course) {
      const allCourses = await db.Course.findAll();
      course = allCourses.find(c => 
        String(c.CourseID) === String(paramId) || 
        String(c.CourseID).padStart(3, '0') === String(paramId)
      );
    }

    if (!course) {
      console.error(`[PUT /courses/${paramId}] Course not found.`);
      return res.status(404).json({ error: 'Course not found in database.' });
    }

    // Determine normalized status for DB write
    const newStatus = status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Pending';
    
    // Update fields dynamically based on Sequelize column existence
    if ('SubmissionStatus' in course) {
      course.SubmissionStatus = newStatus;
    } else if ('status' in course) {
      course.status = newStatus;
    }

    if (newStatus === 'Approved') {
      const now = new Date();
      const expiry = new Date();
      expiry.setFullYear(now.getFullYear() + 3);

      if ('ApprovalDate' in course) course.ApprovalDate = now;
      if ('ApprovalExpiryDate' in course) course.ApprovalExpiryDate = expiry;
      if ('IsActive' in course) course.IsActive = true;
    } else if (newStatus === 'Rejected') {
      if ('IsActive' in course) course.IsActive = false;
      if ('RejectionReason' in course && rejectionReason) course.RejectionReason = rejectionReason;
    }

    await course.save();

    console.log(`[DB SUCCESS] Updated CourseID ${course.CourseID} to status: ${newStatus}`);
    return res.json({ message: 'Course updated successfully.', course: formatCourse(course) });
  } catch (err) {
    console.error('Error updating course status:', err);
    return res.status(500).json({ error: 'Failed to update course in database.' });
  }
});

module.exports = router;