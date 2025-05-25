const getAlivePlayers = (game) => {
  return Object.entries(game.playerData)
    .filter(([_, data]) => data.alive)
    .map(([id]) => id);
};

const getTeamPlayers = (game, team) => {
  return Object.entries(game.playerData)
    .filter(([_, data]) => data.role.team === team && data.alive)
    .map(([id]) => id);
};

const markPlayerDead = (game, userId) => {
  if (game.playerData[userId]) {
    game.playerData[userId].alive = false;
  }
};

module.exports = {
  getAlivePlayers,
  getTeamPlayers,
  markPlayerDead,
};
