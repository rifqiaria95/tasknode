const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  subject: { type: String, required: true },
});

module.exports = mongoose.model('PermissionModel', permissionSchema);
