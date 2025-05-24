// utils/auditLog.js
const { AuditLogs } = require('../models');

/**
 * Creates an audit log entry for a user action.
 * @param {Object} params - Parameters for the audit log.
 * @param {number|null} params.user_id - ID of the user performing the action (nullable for anonymous actions).
 * @param {string} params.entity_type - Type of entity affected (e.g., 'land_plot', 'listing', 'construction_project').
 * @param {string|number} params.entity_id - ID of the affected entity.
 * @param {string} params.action - Action performed (e.g., 'create', 'update', 'delete', 'view').
 * @param {string} params.details - Description of the action.
 * @returns {Promise<void>}
 */
const createAuditLog = async ({ user_id, entity_type, entity_id, action, details }) => {
  try {
    await AuditLogs.create({
      user_id: user_id || null,
      entity_type,
      entity_id: entity_id.toString(), // Convert to string for consistency
      action,
      details,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Optionally, you can rethrow the error or handle it differently
    // throw new Error('Failed to create audit log');
  }
};

module.exports = { createAuditLog };