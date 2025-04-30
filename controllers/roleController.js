const Role = require('../models/RoleModel');
const Permission = require('../models/PermissionModel');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;
  try {
    const role = new Role({ name, permissions });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
