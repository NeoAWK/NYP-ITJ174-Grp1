const express = require('express');
const router = express.Router();
const db = require('../models');
const { validateToken } = require('../middlewares/auth');

// GET /trainers
router.get('/', validateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Only RightSkills (admin) and TrainingProvider can see trainers
    if (user.usertype !== 'RightSkills' && user.usertype !== 'TrainingProvider') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Always include user and provider associations
    const include = [
      {
        model: db.User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      },
      {
        model: db.User,
        as: 'provider',
        attributes: ['id', 'name']
      }
    ];

    // For TrainingProvider, restrict to their own trainers
    const where = {};
    if (user.usertype === 'TrainingProvider') {
      where.providerId = user.id;
    }

    const trainerProfiles = await db.TrainerProfile.findAll({
      where,
      include
    });

    const formatted = trainerProfiles.map(tp => {
      // Provider name: fallback to 'Freelance' if none
      const providerName = tp.provider ? tp.provider.name : 'Freelance';

      // Determine certification validity date
      let certificationValidity = null;
      // Try to get from model fields (order: certificationValidity, then certification)
      const certField = tp.certificationValidity || tp.certification;
      if (certField) {
        const date = new Date(certField);
        if (!isNaN(date.getTime())) {
          certificationValidity = date.toISOString(); // or keep as date object
        }
      }

      return {
        trainerId: tp.userId,          // primary identifier used by the graph
        name: tp.user ? tp.user.name : 'Unknown',
        email: tp.user ? tp.user.email : '',
        providerName: providerName,
        certificationValidity: certificationValidity,
        // Optional: include other fields if needed
        qualifications: tp.qualifications || null,
        certification: tp.certification || null,
        experience: tp.experience || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching trainers:', err);
    res.status(500).json({ error: 'Failed to fetch trainers.' });
  }
});

module.exports = router;