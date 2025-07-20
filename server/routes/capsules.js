const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const TimeCapsule = require('../models/TimeCapsule');
const sendConfirmationEmail = require('../utils/emailSender');


// POST: Create a time capsule
router.post('/', auth, upload.array('media'), async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('Incoming create capsule request:', {
      body: req.body,
      files: req.files,
      user: req.user
    });

    // Validate required fields
    const requiredFields = ['title', 'subject', 'message', 'email', 'deliveryDate'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        console.error(`Missing required field: ${field}`);
        return res.status(400).json({ msg: `Missing required field: ${field}` });
      }
    }

    // Parse deliveryDate to Date object if it's a string
    let deliveryDate = req.body.deliveryDate;
    if (typeof deliveryDate === 'string') {
      deliveryDate = new Date(deliveryDate);
      if (isNaN(deliveryDate.getTime())) {
        console.error('Invalid deliveryDate format:', req.body.deliveryDate);
        return res.status(400).json({ msg: 'Invalid deliveryDate format' });
      }
    }

    const mediaPaths = req.files ? req.files.map(file => file.path) : [];

    const newCapsule = new TimeCapsule({
      user: req.user.id,
      title: req.body.title,
      subject: req.body.subject,
      message: req.body.message,
      email: req.body.email,
      deliveryDate: deliveryDate,
      media: mediaPaths
    });

    await newCapsule.save();

    await sendConfirmationEmail(newCapsule); // optional
    res.status(201).json({ message: 'Time capsule created successfully' });
  } catch (err) {
    console.error('Error creating capsule:', err.message, err);
    res.status(500).json({ msg: 'Server error while creating capsule', error: err.message });
  }
});

// GET: Get all time capsules for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const capsules = await TimeCapsule.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(capsules);
  } catch (err) {
    console.error('Error fetching capsules:', err.message, err);
    res.status(500).json({ msg: 'Server error while fetching capsules', error: err.message });
  }
});

// GET: Get a single time capsule by ID for the logged-in user
router.get('/:id', auth, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({ _id: req.params.id, user: req.user.id });
    if (!capsule) {
      return res.status(404).json({ msg: 'Time capsule not found' });
    }
    res.json(capsule);
  } catch (err) {
    console.error('Error fetching capsule:', err.message, err);
    res.status(500).json({ msg: 'Server error while fetching capsule', error: err.message });
  }
});

// PUT: Update a time capsule by ID for the logged-in user
router.put('/:id', auth, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!capsule) {
      return res.status(404).json({ msg: 'Time capsule not found' });
    }
    res.json(capsule);
  } catch (err) {
    console.error('Error updating capsule:', err.message, err);
    res.status(500).json({ msg: 'Server error while updating capsule', error: err.message });
  }
});

// DELETE: Delete a time capsule by ID for the logged-in user
router.delete('/:id', auth, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!capsule) {
      return res.status(404).json({ msg: 'Time capsule not found' });
    }
    res.json({ msg: 'Time capsule deleted successfully' });
  } catch (err) {
    console.error('Error deleting capsule:', err.message, err);
    res.status(500).json({ msg: 'Server error while deleting capsule', error: err.message });
  }
});

module.exports = router;
