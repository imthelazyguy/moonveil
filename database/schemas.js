const db = require('./firebase');

const getGuildConfig = async (guildId) => {
  const doc = await db.collection('config').doc(guildId).get();
  return doc.exists ? doc.data() : null;
};

const setGuildConfig = async (guildId, config) => {
  await db.collection('config').doc(guildId).set(config, { merge: true });
};

const getGameState = async (guildId) => {
  const doc = await db.collection('games').doc(guildId).get();
  return doc.exists ? doc.data() : null;
};

const updateGameState = async (guildId, state) => {
  await db.collection('games').doc(guildId).set(state, { merge: true });
};

const deleteGameState = async (guildId) => {
  await db.collection('games').doc(guildId).delete();
};

module.exports = {
  getGuildConfig,
  setGuildConfig,
  getGameState,
  updateGameState,
  deleteGameState
};
