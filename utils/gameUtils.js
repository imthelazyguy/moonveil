module.exports = {
  async assignRoles(players, roles) {
    try {
      const shuffled = players.sort(() => 0.5 - Math.random());
      const assigned = {};

      roles.forEach((role, i) => {
        assigned[shuffled[i]] = role;
      });

      return assigned;
    } catch (err) {
      console.error('Error assigning roles:', err);
      throw err;
    }
  },

  getTeam(role) {
    if (['werewolf', 'alpha'].includes(role)) return 'werewolves';
    if (['seer', 'villager', 'bodyguard'].includes(role)) return 'villagers';
    return 'neutral';
  },

  isAlive(playerData) {
    return !playerData.dead;
  }
};
