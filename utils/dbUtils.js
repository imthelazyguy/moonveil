const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

module.exports = {
  async getGame(guildId) {
    try {
      const doc = await db.collection('games').doc(guildId).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error('Error fetching game data:', err);
      return null;
    }
  },

  async saveGame(guildId, gameData) {
    try {
      await db.collection('games').doc(guildId).set(gameData);
    } catch (err) {
      console.error('Error saving game data:', err);
    }
  },

  async deleteGame(guildId) {
    try {
      await db.collection('games').doc(guildId).delete();
    } catch (err) {
      console.error('Error deleting game data:', err);
    }
  }
};
