// utils/balanceChecker.js
module.exports = {
  checkGameEnd: (players) => {
    // players: array of {id, role, alive: boolean}
    const alivePlayers = players.filter(p => p.alive);
    const aliveWerewolves = alivePlayers.filter(p => p.role.toLowerCase().includes('werewolf'));
    const aliveVillagers = alivePlayers.filter(p => !p.role.toLowerCase().includes('werewolf'));

    if (aliveWerewolves.length === 0) return 'Villagers Win!';
    if (aliveWerewolves.length >= aliveVillagers.length) return 'Werewolves Win!';

    return null; // Game continues
  },
};
