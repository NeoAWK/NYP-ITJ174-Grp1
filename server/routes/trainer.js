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

    // Build include for trainer_profiles
    const include = [
      {
        model: db.User,
        as: 'user',        // alias referencing the trainer's user account
        attributes: ['id', 'name', 'email']
      }
    ]; 

    // If admin, also include provider info (the training provider who owns the trainer)
    if (user.usertype === 'RightSkills') {
      include.push({
        model: db.User,
        as: 'provider',    // alias for the provider user
        attributes: ['id', 'name'],
        order: ["Provider"]
      });
    }

    // Build where clause: for TrainingProvider, filter by providerId = user.id
    const where = {};
    if (user.usertype === 'TrainingProvider') {
      where.providerId = user.id;
    }

    const trainerProfiles = await db.TrainerProfile.findAll({
      where,
      include
    });

    // Format response
    const formatted = trainerProfiles.map(tp => {
      const result = {
        trainerId: tp.userId,
        name: tp.user ? tp.user.name : 'Unknown',
        email: tp.user ? tp.user.email : '',
        qualifications: tp.qualifications || null,
        certification: tp.certification || null,
        experience: tp.experience || null,
      };
      if (user.usertype === 'RightSkills') {
         result.providerName = tp.providerId ? tp.provider.name : 'Freelance';
      }
      return result;
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching trainers:', err);
    res.status(500).json({ error: 'Failed to fetch trainers.' });
  }
});

module.exports = router;