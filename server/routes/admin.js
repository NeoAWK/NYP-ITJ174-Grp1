const express = require('express');
const router = express.Router();
const db = require('../models');

// GET: Fetch all admin logs
router.get('/logs', async (req, res) => {
  try {
    if (!db.AdminLog) {
      return res.status(404).json({ error: 'AdminLog model is not registered.' });
    }
    const logs = await db.AdminLog.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching admin logs:', err);
    res.status(500).json({ error: 'Failed to fetch admin logs.' });
  }
});

// POST: Create a new log entry
router.post('/logs', async (req, res) => {
  const { adminEmail, action, targetEntity, details } = req.body;
  try {
    if (!db.AdminLog) {
      return res.status(404).json({ error: 'AdminLog model is not registered.' });
    }
    const newLog = await db.AdminLog.create({
      adminEmail,
      action,
      targetEntity,
      details
    });
    res.status(201).json(newLog);
  } catch (err) {
    console.error('Error creating admin log:', err);
    res.status(500).json({ error: 'Failed to log admin action.' });
  }
});

// PUT: Approve a course submission
router.put('/courses/:id/approve', async (req, res) => {
  const { adminEmail } = req.body;
  const courseId = req.params.id;

  try {
    if (!db.Course) {
      return res.status(404).json({ error: 'Course model is not registered.' });
    }

    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 3);

    // Update course status and accreditation validity
    course.SubmissionStatus = 'Approved';
    course.ApprovalDate = now;
    course.ApprovalExpiryDate = expiry;
    course.IsActive = true;
    await course.save();

    // Log the approval action
    if (db.AdminLog) {
      await db.AdminLog.create({
        adminEmail: adminEmail || 'admin123@abc.com',
        action: 'COURSE_APPROVED',
        targetEntity: course.CourseTitle || `Course #${courseId}`,
        details: `Approved course ${courseId}. Validity set through ${expiry.toISOString().split('T')[0]}.`
      });
    }

    res.json({ message: 'Course successfully approved.', course });
  } catch (err) {
    console.error('Error approving course:', err);
    res.status(500).json({ error: 'Failed to approve course.' });
  }
});

// PUT: Reject a course submission
router.put('/courses/:id/reject', async (req, res) => {
  const { adminEmail, reason } = req.body;
  const courseId = req.params.id;

  try {
    if (!db.Course) {
      return res.status(404).json({ error: 'Course model is not registered.' });
    }

    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Update course status
    course.SubmissionStatus = 'Rejected';
    course.IsActive = false;
    await course.save();

    // Log the rejection action
    if (db.AdminLog) {
      await db.AdminLog.create({
        adminEmail: adminEmail || 'admin123@abc.com',
        action: 'COURSE_REJECTED',
        targetEntity: course.CourseTitle || `Course #${courseId}`,
        details: reason ? `Rejected course ${courseId}. Reason: ${reason}` : `Rejected course ${courseId}.`
      });
    }

    res.json({ message: 'Course successfully rejected.', course });
  } catch (err) {
    console.error('Error rejecting course:', err);
    res.status(500).json({ error: 'Failed to reject course.' });
  }
});

module.exports = router;