const { ArchitectProfiles, User } = require('../models');
const { Op } = require('sequelize');

// Get all architects with optional filtering
const getArchitects = async (req, res) => {
  try {
    const { location, specialty, minRating } = req.query;

    const whereClause = {};
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (specialty) whereClause.specialty = { [Op.like]: `%${specialty}%` };

    const architects = await ArchitectProfiles.findAll({
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email', 'phone'],
          where: minRating ? { rating: { [Op.gte]: parseFloat(minRating) } } : {},
        },
      ],
      where: whereClause,
    });

    res.status(200).json(architects);
  } catch (error) {
    console.error('Error fetching architects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single architect by ID
const getArchitectById = async (req, res) => {
  try {
    const { architectId } = req.params;

    const architect = await ArchitectProfiles.findByPk(architectId, {
      include: [
        { model: User, attributes: ['user_id', 'name', 'email', 'phone'] },
      ],
    });

    if (!architect) {
      return res.status(404).json({ message: 'Architect not found' });
    }

    res.status(200).json(architect);
  } catch (error) {
    console.error('Error fetching architect:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new architect profile
const createArchitectProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { registration_number, location, specialty, bio } = req.body;

    // Validate required fields
    if (!registration_number) {
      return res.status(400).json({ message: 'Registration number is required' });
    }

    // Check if user already has an architect profile
    const existingProfile = await ArchitectProfiles.findOne({ where: { architect_id: userId } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Architect profile already exists for this user' });
    }

    const architect = await ArchitectProfiles.create({
      architect_id: userId,
      registration_number,
      location,
      specialty,
      bio,
    });

    res.status(201).json({ message: 'Architect profile created successfully', architect });
  } catch (error) {
    console.error('Error creating architect profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an architect profile
const updateArchitectProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { architectId } = req.params;
    const { registration_number, location, specialty, bio } = req.body;

    const architect = await ArchitectProfiles.findByPk(architectId);
    if (!architect) {
      return res.status(404).json({ message: 'Architect profile not found' });
    }

    // Ensure the user owns the profile
    if (architect.architect_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this profile' });
    }

    await architect.update({
      registration_number: registration_number || architect.registration_number,
      location: location || architect.location,
      specialty: specialty || architect.specialty,
      bio: bio || architect.bio,
    });

    res.status(200).json({ message: 'Architect profile updated successfully', architect });
  } catch (error) {
    console.error('Error updating architect profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete an architect profile
const deleteArchitectProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { architectId } = req.params;

    const architect = await ArchitectProfiles.findByPk(architectId);
    if (!architect) {
      return res.status(404).json({ message: 'Architect profile not found' });
    }

    if (architect.architect_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this profile' });
    }

    await architect.destroy();
    res.status(200).json({ message: 'Architect profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting architect profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get architects by specialty (optional utility)
const getArchitectsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;

    const architects = await ArchitectProfiles.findAll({
      where: { specialty: { [Op.like]: `%${specialty}%` } },
      include: [
        { model: User, attributes: ['user_id', 'name', 'email', 'phone'] },
      ],
    });

    res.status(200).json(architects);
  } catch (error) {
    console.error('Error fetching architects by specialty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getArchitects,
  getArchitectById,
  createArchitectProfile,
  updateArchitectProfile,
  deleteArchitectProfile,
  getArchitectsBySpecialty,
};