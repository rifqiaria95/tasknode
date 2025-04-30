const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const Role = require('../models/RoleModel');

async function defineAbilitiesFor(user) {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  const role = await Role.findById(user.role).populate('permissions');

  if (role) {
    role.permissions.forEach(permission => {
      can(permission.action, permission.subject);
    });
  }

  return createMongoAbility(rules);
}

module.exports = defineAbilitiesFor;
