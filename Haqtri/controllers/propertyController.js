const { LandPlots, ConstructionProjects, Inventory, PaymentMilestones, User } = require('../models');
const { Op } = require('sequelize');

// Get all properties (land plots) with optional filtering
const getProperties = async (req, res) => {
  try {
    const { location, minSize, maxSize, ownerId } = req.query;

    const whereClause = {};
    if (location) whereClause.address = { [Op.like]: `%${location}%` };
    if (minSize) whereClause.size = { [Op.gte]: parseFloat(minSize) };
    if (maxSize) whereClause.size = { [Op.lte]: parseFloat(maxSize) };
    if (ownerId) whereClause.owner_id = parseInt(ownerId);

    const properties = await LandPlots.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'owner', attributes: ['user_id', 'name', 'email'] },
        { model: ConstructionProjects, attributes: ['project_id', 'status', 'start_date', 'completion_date'] },
      ],
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single property by ID
const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await LandPlots.findByPk(propertyId, {
      include: [
        { model: User, as: 'owner', attributes: ['user_id', 'name', 'email'] },
        { model: ConstructionProjects, attributes: ['project_id', 'status', 'start_date', 'completion_date'] },
        { model: Inventory, attributes: ['inventory_id', 'material_id', 'quantity'] },
      ],
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new property (land plot)
const createProperty = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { address, size, zoning_laws, environmental_impact_report, vr_model_path } = req.body;

    // Validate required fields
    if (!address || !size) {
      return res.status(400).json({ message: 'Address and size are required' });
    }

    const property = await LandPlots.create({
      owner_id: userId,
      address,
      size: parseFloat(size),
      zoning_laws,
      environmental_impact_report,
      vr_model_path,
    });

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a property
const updateProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { address, size, zoning_laws, environmental_impact_report, vr_model_path } = req.body;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Ensure the user owns the property
    if (property.owner_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this property' });
    }

    await property.update({
      address: address || property.address,
      size: size ? parseFloat(size) : property.size,
      zoning_laws: zoning_laws || property.zoning_laws,
      environmental_impact_report: environmental_impact_report || property.environmental_impact_report,
      vr_model_path: vr_model_path || property.vr_model_path,
    });

    res.status(200).json({ message: 'Property updated successfully', property });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a property
const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this property' });
    }

    await property.destroy();
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add inventory to a property
const addInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { material_id, quantity } = req.body;

    if (!material_id || !quantity) {
      return res.status(400).json({ message: 'Material ID and quantity are required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to add inventory to this property' });
    }

    const inventory = await Inventory.create({
      plot_id: propertyId,
      material_id: parseInt(material_id),
      quantity: parseInt(quantity),
    });

    res.status(201).json({ message: 'Inventory added successfully', inventory });
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get construction projects for a property
const getConstructionProjects = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const projects = await ConstructionProjects.findAll({
      where: { plot_id: propertyId },
      include: [
        { model: User, as: 'worker', attributes: ['user_id', 'name'] },
        { model: User, as: 'agent', attributes: ['user_id', 'name'] },
        { model: PaymentMilestones, attributes: ['milestone_id', 'amount', 'due_date', 'paid'] },
      ],
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching construction projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a construction project for a property
const createConstructionProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { worker_id, agent_id, start_date, completion_date, status } = req.body;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to create a project for this property' });
    }

    const project = await ConstructionProjects.create({
      plot_id: propertyId,
      worker_id: worker_id ? parseInt(worker_id) : null,
      agent_id: agent_id ? parseInt(agent_id) : null,
      start_date,
      completion_date,
      status: status || 'planned',
    });

    res.status(201).json({ message: 'Construction project created successfully', project });
  } catch (error) {
    console.error('Error creating construction project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  addInventory,
  getConstructionProjects,
  createConstructionProject,
};