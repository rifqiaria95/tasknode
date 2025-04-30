const mongoose   = require('mongoose');
const Role       = require('./models/RoleModel');
const Permission = require('./models/PermissionModel');

const mongoURI = 'mongodb://127.0.0.1:27017/rproject';

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');

    // Bersihin dulu
    await Role.deleteMany();
    await Permission.deleteMany();

    // 1. Buat Permission
    const permissions = await Permission.insertMany([
      { action: 'create', subject: 'User' },
      { action: 'read', subject: 'User' },
      { action: 'update', subject: 'User' },
      { action: 'delete', subject: 'User' },

      { action: 'create', subject: 'Post' },
      { action: 'read', subject: 'Post' },
      { action: 'update', subject: 'Post' },
      { action: 'delete', subject: 'Post' },
    ]);

    // 2. Buat Role
    const adminRole = new Role({
      name: 'admin',
      permissions: permissions.map(p => p._id),
    });

    const editorRole = new Role({
      name: 'editor',
      permissions: permissions.filter(p =>
        ['create', 'read', 'update'].includes(p.action) && p.subject === 'Post'
      ).map(p => p._id),
    });

    const viewerRole = new Role({
      name: 'viewer',
      permissions: permissions.filter(p =>
        p.action === 'read'
      ).map(p => p._id),
    });

    await Promise.all([adminRole.save(), editorRole.save(), viewerRole.save()]);

    console.log('Seeder selesai 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Seeder gagal:', err);
    process.exit(1);
  }
};

seed();
