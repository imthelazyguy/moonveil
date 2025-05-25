const rolesData = require('../data/roles.json'); // Holds metadata for all roles

class RoleManager {
  constructor() {
    this.availableRoles = new Map(); // name => data
    this.loadRoles();
  }

  loadRoles() {
    for (const role of rolesData) {
      this.availableRoles.set(role.name.toLowerCase(), role);
    }
  }

  /**
   * Assign roles to players based on config or default pool
   * @param {Array} players - Array of Discord user objects
   * @param {Array} roleNames - Optional array of role names to assign
   * @returns {Map<userId, roleObject>}
   */
  assignRoles(players, roleNames = []) {
    const assignments = new Map();
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const rolePool = roleNames.length > 0 ? roleNames : Array.from(this.availableRoles.keys());

    if (shuffledPlayers.length > rolePool.length) throw new Error('Not enough roles for players');

    for (let i = 0; i < shuffledPlayers.length; i++) {
      const user = shuffledPlayers[i];
      const roleKey = rolePool[i].toLowerCase();
      const role = this.availableRoles.get(roleKey);
      if (!role) throw new Error(`Unknown role: ${roleKey}`);
      assignments.set(user.id, role);
    }

    return assignments;
  }

  /**
   * Get role data by name
   * @param {string} roleName
   * @returns {Object}
   */
  getRole(roleName) {
    return this.availableRoles.get(roleName.toLowerCase());
  }

  /**
   * Get all roles for display or selection
   * @returns {Array}
   */
  listRoles() {
    return Array.from(this.availableRoles.values());
  }
}

module.exports = new RoleManager();
