const { AbilityBuilder, Ability } = require('@casl/ability');
const Role = require('../models/RoleModel');

async function defineAbilitiesFor(user) {
  const { can, rules } = new AbilityBuilder(Ability);

  const role = await Role.findOne({ name: user.role }).populate('permissions');

  if (role) {
    role.permissions.forEach(permission => {
      can(permission.action, permission.subject);
    });
  }

  return new Ability(rules);
}

module.exports = defineAbilitiesFor;
