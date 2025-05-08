const Permission = require('../models/PermissionModel');

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPermission = async (req, res) => {
  const { action, subject } = req.body;
  try {
    const permission = new Permission({ action, subject });
    await permission.save();
    res.status(201).json(permission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(permission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    await Permission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Permission deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
