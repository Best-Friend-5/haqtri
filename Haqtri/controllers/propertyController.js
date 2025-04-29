const { 
  LandPlots, 
  ConstructionProjects, 
  Inventory, 
  PaymentMilestones, 
  Users, 
  Bookmarks, 
  Reviews, 
  Messages, 
  MarketplaceListings, 
  VerificationDocuments, 
  AuditLogs, 
  FeatureFlags 
} = require('../models');
const { Op, Sequelize } = require('sequelize');
const { createAuditLog } = require('../utils/auditLog');

// Get all properties (land plots) with filtering, pagination, and sorting
const getProperties = async (req, res) => {
  try {
    const { 
      location, 
      minSize, 
      maxSize, 
      ownerId, 
      sustainabilityScore, 
      permitStatus, 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const whereClause = {};
    if (location) whereClause.address = { [Op.like]: `%${location}%` };
    if (minSize) whereClause.size = { [Op.gte]: parseFloat(minSize) };
    if (maxSize) whereClause.size = { [Op.lte]: parseFloat(maxSize) };
    if (ownerId) whereClause.owner_id = parseInt(ownerId);
    if (sustainabilityScore) whereClause.sustainability_score = { [Op.gte]: parseFloat(sustainabilityScore) };
    if (permitStatus) {
      whereClause.permit_expiry_date = permitStatus === 'valid' 
        ? { [Op.gte]: new Date() } 
        : { [Op.or]: [{ [Op.lt]: new Date() }, { [Op.is]: null }] };
    }

    const offset = (page - 1) * limit;

    const properties = await LandPlots.findAndCountAll({
      where: whereClause,
      include: [
        { model: Users, as: 'owner', attributes: ['user_id', 'first_name', 'last_name', 'email', 'profile_picture_url'] },
        { model: ConstructionProjects, attributes: ['project_id', 'status', 'start_date', 'completion_date'] },
        { model: MarketplaceListings, attributes: ['listing_id', 'title', 'price', 'status'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.status(200).json({
      total: properties.count,
      page: parseInt(page),
      totalPages: Math.ceil(properties.count / limit),
      properties: properties.rows
    });
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
        { model: Users, as: 'owner', attributes: ['user_id', 'first_name', 'last_name', 'email', 'profile_picture_url'] },
        { model: ConstructionProjects, attributes: ['project_id', 'status', 'start_date', 'completion_date'] },
        { model: Inventory, attributes: ['material_id', 'quantity', 'last_restocked_at'] },
        { model: MarketplaceListings, attributes: ['listing_id', 'title', 'price', 'status'] },
        { model: VerificationDocuments, where: { verified: true }, required: false, attributes: ['document_type', 'document_name'] }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create audit log for view
    await createAuditLog({
      user_id: req.user?.id || null,
      entity_type: 'land_plot',
      entity_id: propertyId,
      action: 'view',
      details: `Viewed property ID ${propertyId}`
    });

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new property (land plot)
const createProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      address, 
      size, 
      zoning_laws, 
      environmental_impact_report, 
      vr_model_path, 
      latitude, 
      longitude, 
      permit_expiry_date, 
      sustainability_score 
    } = req.body;

    // Validate required fields
    if (!address || !size) {
      return res.status(400).json({ message: 'Address and size are required' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const property = await LandPlots.create({
        owner_id: userId,
        address,
        size: parseFloat(size),
        zoning_laws,
        environmental_impact_report,
        vr_model_path,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        permit_expiry_date,
        sustainability_score: sustainability_score ? parseFloat(sustainability_score) : null
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'land_plot',
        entity_id: property.plot_id,
        action: 'create',
        details: `Created new property at ${address}`
      });

      res.status(201).json({ message: 'Property created successfully', property });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    const { 
      address, 
      size, 
      zoning_laws, 
      environmental_impact_report, 
      vr_model_path, 
      latitude, 
      longitude, 
      permit_expiry_date, 
      sustainability_score 
    } = req.body;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to update this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await property.update({
        address: address || property.address,
        size: size ? parseFloat(size) : property.size,
        zoning_laws: zoning_laws || property.zoning_laws,
        environmental_impact_report: environmental_impact_report || property.environmental_impact_report,
        vr_model_path: vr_model_path || property.vr_model_path,
        latitude: latitude !== undefined ? parseFloat(latitude) : property.latitude,
        longitude: longitude !== undefined ? parseFloat(longitude) : property.longitude,
        permit_expiry_date: permit_expiry_date || property.permit_expiry_date,
        sustainability_score: sustainability_score !== undefined ? parseFloat(sustainability_score) : property.sustainability_score
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'land_plot',
        entity_id: propertyId,
        action: 'update',
        details: `Updated property at ${property.address}`
      });

      res.status(200).json({ message: 'Property updated successfully', property });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to delete this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      // Check if property is listed in marketplace
      const listing = await MarketplaceListings.findOne({ where: { plot_id: propertyId } });
      if (listing && listing.status !== 'sold') {
        await listing.update({ status: 'deleted' }, { transaction });
      }

      await property.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'land_plot',
        entity_id: propertyId,
        action: 'delete',
        details: `Deleted property at ${property.address}`
      });

      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

    if (!material_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid material ID and quantity are required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to add inventory to this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const inventory = await Inventory.create({
        plot_id: propertyId,
        material_id: parseInt(material_id),
        quantity: parseInt(quantity),
        last_restocked_at: new Date()
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'inventory',
        entity_id: `${propertyId}-${material_id}`,
        action: 'create',
        details: `Added ${quantity} units of material ${material_id} to property ${propertyId}`
      });

      res.status(201).json({ message: 'Inventory added successfully', inventory });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update inventory for a property
const updateInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, materialId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to update inventory for this property' });
    }

    const inventory = await Inventory.findOne({
      where: { plot_id: propertyId, material_id: materialId }
    });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await inventory.update({
        quantity: parseInt(quantity),
        last_restocked_at: quantity > inventory.quantity ? new Date() : inventory.last_restocked_at
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'inventory',
        entity_id: `${propertyId}-${materialId}`,
        action: 'update',
        details: `Updated inventory to ${quantity} units for material ${materialId} on property ${propertyId}`
      });

      res.status(200).json({ message: 'Inventory updated successfully', inventory });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete inventory from a property
const deleteInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, materialId } = req.params;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to delete inventory from this property' });
    }

    const inventory = await Inventory.findOne({
      where: { plot_id: propertyId, material_id: materialId }
    });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await inventory.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'inventory',
        entity_id: `${propertyId}-${materialId}`,
        action: 'delete',
        details: `Deleted inventory for material ${materialId} from property ${propertyId}`
      });

      res.status(200).json({ message: 'Inventory deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get construction projects for a property
const getConstructionProjects = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { plot_id: propertyId };
    if (status) whereClause.status = status;

    const projects = await ConstructionProjects.findAndCountAll({
      where: whereClause,
      include: [
        { model: Users, as: 'worker', attributes: ['user_id', 'first_name', 'last_name'] },
        { model: Users, as: 'agent', attributes: ['user_id', 'first_name', 'last_name'] },
        { model: PaymentMilestones, attributes: ['milestone_id', 'amount', 'due_date', 'paid'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['start_date', 'DESC']]
    });

    res.status(200).json({
      total: projects.count,
      page: parseInt(page),
      totalPages: Math.ceil(projects.count / limit),
      projects: projects.rows
    });
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
    const { worker_id, agent_id, start_date, completion_date, status, job_posting_id } = req.body;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to create a project for this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const project = await ConstructionProjects.create({
        plot_id: propertyId,
        worker_id: worker_id ? parseInt(worker_id) : null,
        agent_id: agent_id ? parseInt(agent_id) : null,
        start_date,
        completion_date,
        status: status || 'planned',
        job_posting_id: job_posting_id ? parseInt(job_posting_id) : null
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'construction_project',
        entity_id: project.project_id,
        action: 'create',
        details: `Created construction project for property ${propertyId}`
      });

      // Notify worker and agent
      if (worker_id || agent_id) {
        await Messages.bulkCreate([
          worker_id && {
            sender_id: userId,
            receiver_id: worker_id,
            content: `You've been assigned as a worker to a new construction project for property at ${property.address}`,
            status: 'sent'
          },
          agent_id && {
            sender_id: userId,
            receiver_id: agent_id,
            content: `You've been assigned as an agent to a new construction project for property at ${property.address}`,
            status: 'sent'
          }
        ].filter(Boolean));
      }

      res.status(201).json({ message: 'Construction project created successfully', project });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating construction project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a construction project
const updateConstructionProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { worker_id, agent_id, start_date, completion_date, status, job_posting_id } = req.body;

    const project = await ConstructionProjects.findByPk(projectId, {
      include: [{ model: LandPlots, as: 'plot' }]
    });
    if (!project) {
      return res.status(404).json({ message: 'Construction project not found' });
    }

    if (project.plot.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to update this project' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await project.update({
        worker_id: worker_id !== undefined ? parseInt(worker_id) : project.worker_id,
        agent_id: agent_id !== undefined ? parseInt(agent_id) : project.agent_id,
        start_date: start_date || project.start_date,
        completion_date: completion_date || project.completion_date,
        status: status || project.status,
        job_posting_id: job_posting_id !== undefined ? parseInt(job_posting_id) : project.job_posting_id
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'construction_project',
        entity_id: projectId,
        action: 'update',
        details: `Updated construction project ${projectId}`
      });

      res.status(200).json({ message: 'Construction project updated successfully', project });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating construction project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a construction project
const deleteConstructionProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    const project = await ConstructionProjects.findByPk(projectId, {
      include: [{ model: LandPlots, as: 'plot' }]
    });
    if (!project) {
      return res.status(404).json({ message: 'Construction project not found' });
    }

    if (project.plot.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to delete this project' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await project.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'construction_project',
        entity_id: projectId,
        action: 'delete',
        details: `Deleted construction project ${projectId}`
      });

      res.status(200).json({ message: 'Construction project deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting construction project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a payment milestone
const createPaymentMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { amount, due_date } = req.body;

    if (!amount || !due_date) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    const project = await ConstructionProjects.findByPk(projectId, {
      include: [{ model: LandPlots, as: 'plot' }]
    });
    if (!project) {
      return res.status(404).json({ message: 'Construction project not found' });
    }

    if (project.plot.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to create payment milestones for this project' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const milestone = await PaymentMilestones.create({
        project_id: projectId,
        amount: parseFloat(amount),
        due_date,
        paid: false
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'payment_milestone',
        entity_id: milestone.milestone_id,
        action: 'create',
        details: `Created payment milestone of ${amount} for project ${projectId}`
      });

      res.status(201).json({ message: 'Payment milestone created successfully', milestone });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating payment milestone:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a payment milestone
const updatePaymentMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;
    const { amount, due_date, paid } = req.body;

    const milestone = await PaymentMilestones.findByPk(milestoneId, {
      include: [{ model: ConstructionProjects, as: 'project', include: [{ model: LandPlots, as: 'plot' }] }]
    });
    if (!milestone) {
      return res.status(404).json({ message: 'Payment milestone not found' });
    }

    if (milestone.project.plot.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to update this payment milestone' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await milestone.update({
        amount: amount ? parseFloat(amount) : milestone.amount,
        due_date: due_date || milestone.due_date,
        paid: paid !== undefined ? Boolean(paid) : milestone.paid
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'payment_milestone',
        entity_id: milestoneId,
        action: 'update',
        details: `Updated payment milestone ${milestoneId}`
      });

      res.status(200).json({ message: 'Payment milestone updated successfully', milestone });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating payment milestone:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a payment milestone
const deletePaymentMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;

    const milestone = await PaymentMilestones.findByPk(milestoneId, {
      include: [{ model: ConstructionProjects, as: 'project', include: [{ model: LandPlots, as: 'plot' }] }]
    });
    if (!milestone) {
      return res.status(404).json({ message: 'Payment milestone not found' });
    }

    if (milestone.project.plot.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to delete this payment milestone' });
    }

    const transaction = await Sequelize.transaction();

    try {
      await milestone.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'payment_milestone',
        entity_id: milestoneId,
        action: 'delete',
        details: `Deleted payment milestone ${milestoneId}`
      });

      res.status(200).json({ message: 'Payment milestone deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting payment milestone:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bookmark a property
const bookmarkProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const existingBookmark = await Bookmarks.findOne({
      where: { user_id: userId, post_id: propertyId }
    });
    if (existingBookmark) {
      return res.status(400).json({ message: 'Property already bookmarked' });
    }

    const bookmark = await Bookmarks.create({
      user_id: userId,
      post_id: propertyId
    });

    // Create audit log
    await createAuditLog({
      user_id: userId,
      entity_type: 'bookmark',
      entity_id: propertyId,
      action: 'create',
      details: `Bookmarked property at ${property.address}`
    });

    res.status(201).json({ message: 'Property bookmarked successfully', bookmark });
  } catch (error) {
    console.error('Error bookmarking property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove bookmark from a property
const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const bookmark = await Bookmarks.findOne({
      where: { user_id: userId, post_id: propertyId }
    });
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.destroy();

    // Create audit log
    await createAuditLog({
      user_id: userId,
      entity_type: 'bookmark',
      entity_id: propertyId,
      action: 'delete',
      details: `Removed bookmark from property ${propertyId}`
    });

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Contact property owner
const contactOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id === userId) {
      return res.status(400).json({ message: 'Cannot contact yourself' });
    }

    await Messages.create({
      sender_id: userId,
      receiver_id: property.owner_id,
      content: `Regarding your property at ${property.address}: ${message}`,
      status: 'sent'
    });

    // Create audit log
    await createAuditLog({
      user_id: userId,
      entity_type: 'message',
      entity_id: propertyId,
      action: 'create',
      details: `Sent message to owner of property ${propertyId}`
    });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error contacting owner:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit a review for a property
const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { rating, review_text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user has interacted with the property (e.g., via marketplace purchase)
    const listing = await MarketplaceListings.findOne({
      where: { plot_id: propertyId, buyer_id: userId, status: 'sold' }
    });
    if (!listing) {
      return res.status(403).json({ message: 'Only buyers who purchased this property can review' });
    }

    const existingReview = await Reviews.findOne({
      where: {
        reviewer_id: userId,
        entity_type: 'plot',
        entity_id: propertyId
      }
    });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const review = await Reviews.create({
        reviewer_id: userId,
        reviewed_id: property.owner_id,
        entity_type: 'plot',
        entity_id: propertyId,
        rating,
        review_text
      }, { transaction });

      // Update owner's average rating
      const ownerReviews = await Reviews.findAll({ where: { reviewed_id: property.owner_id } });
      const avgRating = ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length;
      await Users.update(
        { average_rating: avgRating },
        { where: { user_id: property.owner_id }, transaction }
      );

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'review',
        entity_id: review.review_id,
        action: 'create',
        details: `Submitted review for property ${propertyId}`
      });

      res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews for a property
const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const reviews = await Reviews.findAndCountAll({
      where: {
        entity_type: 'plot',
        entity_id: propertyId
      },
      include: [
        { model: Users, as: 'reviewer', attributes: ['user_id', 'first_name', 'last_name', 'profile_picture_url'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      total: reviews.count,
      page: parseInt(page),
      totalPages: Math.ceil(reviews.count / limit),
      reviews: reviews.rows
    });
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Upload verification document for a property
const uploadVerificationDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { document_type, file_path, document_name } = req.body;

    if (!document_type || !file_path || !document_name) {
      return res.status(400).json({ message: 'Document type, file path, and name are required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to upload documents for this property' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const document = await VerificationDocuments.create({
        user_id: userId,
        listing_id: null, // Assuming property verification doesn't link to marketplace_listings directly
        document_type,
        file_path,
        document_name,
        verified: false
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'verification_document',
        entity_id: document.doc_id,
        action: 'create',
        details: `Uploaded verification document for property ${propertyId}`
      });

      res.status(201).json({ message: 'Document uploaded successfully', document });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error uploading verification document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify a property (admin only)
const verifyProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { verification_notes } = req.body;

    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const transaction = await Sequelize.transaction();

    try {
      // Assuming verification status is tracked via related marketplace listing
      const listing = await MarketplaceListings.findOne({ where: { plot_id: propertyId } });
      if (listing) {
        await listing.update({ verified_at: new Date() }, { transaction });
      }

      await VerificationDocuments.update(
        { verified: true, verification_notes },
        { where: { user_id: property.owner_id, listing_id: listing?.listing_id || null }, transaction }
      );

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'land_plot',
        entity_id: propertyId,
        action: 'verify',
        details: `Verified property at ${property.address}`
      });

      // Notify owner
      await Messages.create({
        sender_id: userId,
        receiver_id: property.owner_id,
        content: `Your property at ${property.address} has been verified`,
        status: 'sent'
      });

      res.status(200).json({ message: 'Property verified successfully', property });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error verifying property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check feature flag for property-related features
const checkFeatureFlag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { flag_name } = req.params;

    const featureFlag = await FeatureFlags.findOne({
      where: {
        flag_name,
        [Op.or]: [{ user_id: userId }, { user_id: null }]
      }
    });

    if (!featureFlag) {
      return res.status(404).json({ message: 'Feature flag not found' });
    }

    res.status(200).json({
      flag_name: featureFlag.flag_name,
      is_enabled: featureFlag.is_enabled
    });
  } catch (error) {
    console.error('Error checking feature flag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// List property on marketplace
const listPropertyOnMarketplace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    const { title, description, price, location, keywords } = req.body;

    if (!title || !description || !price || !location) {
      return res.status(400).json({ message: 'Title, description, price, and location are required' });
    }

    const property = await LandPlots.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id !== userId && !req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized to list this property' });
    }

    const existingListing = await MarketplaceListings.findOne({
      where: { plot_id: propertyId, status: { [Op.ne]: 'sold' } }
    });
    if (existingListing) {
      return res.status(400).json({ message: 'Property is already listed' });
    }

    const transaction = await Sequelize.transaction();

    try {
      const listing = await MarketplaceListings.create({
        user_id: userId,
        type: 'plot',
        title,
        description,
        price: parseFloat(price),
        location,
        status: 'active',
        keywords,
        plot_id: propertyId
      }, { transaction });

      await transaction.commit();

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'marketplace_listing',
        entity_id: listing.listing_id,
        action: 'create',
        details: `Listed property ${propertyId} on marketplace as ${title}`
      });

      res.status(201).json({ message: 'Property listed successfully', listing });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error listing property on marketplace:', error);
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
  updateInventory,
  deleteInventory,
  getConstructionProjects,
  createConstructionProject,
  updateConstructionProject,
  deleteConstructionProject,
  createPaymentMilestone,
  updatePaymentMilestone,
  deletePaymentMilestone,
  bookmarkProperty,
  removeBookmark,
  contactOwner,
  submitReview,
  getPropertyReviews,
  uploadVerificationDocument,
  verifyProperty,
  checkFeatureFlag,
  listPropertyOnMarketplace
};