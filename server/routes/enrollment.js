const express = require('express');
const router = express.Router();
const { Enrollment, Course, User } = require('../models');
const { validateToken } = require('../middlewares/auth');

// POST /enrollment/enroll
router.post('/enroll', validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required.' });
    }

    // Check if already enrolled in the enrollments table
    const existing = await Enrollment.findOne({
      where: { userId, courseId: String(courseId) }
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    // Create new row in 'enrollments' table
    const newEnrollment = await Enrollment.create({
      userId,
      courseId: String(courseId),
      status: 'Enrolled'
    });

    return res.status(201).json({
      message: 'Successfully enrolled!',
      enrollment: newEnrollment
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    return res.status(500).json({ error: 'Server error during enrollment.' });
  }
});

// GET /enrollment/my-courses
router.get('/my-courses', validateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['CourseID', 'CourseTitle', 'Category', 'CourseLevel'] // ✅ Replaced 'id' with 'CourseID'
        }
      ]
    });

    return res.json({ enrollments });
  } catch (err) {
    console.error('Fetch detailed enrollments error:', err);
    return res.status(500).json({ error: 'Failed to fetch enrolled courses.' });
  }
});

router.get('/all',  async (req, res) => {
  try {
    // Restrict to officers/admins (adjust role names as needed)

    const enrollments = await Enrollment.findAll({
      include: [
        {
          model: User,
          as: 'user',          // must match the alias defined in the association
          attributes: ['id', 'name', 'email', 'usertype'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['CourseID', 'CourseTitle', 'SubmissionStatus', 'TrainerID'],
        },
      ],
    });

    return res.json({ enrollments });
  } catch (err) {
    console.error('Fetch all enrollments error:', err);
    return res.status(500).json({ error: 'Failed to fetch all enrollments.' });
  }
});

module.exports = router;