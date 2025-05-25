// This file will hold utility functions, Firestore interactions, and event-based helpers
// Starting with dbUtils.js

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

module.exports = {
  async getGame(guildId) {
    try {
      const doc = await db.collection('games').doc(guildId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error(`Firestore getGame error:`, error);
      throw new Error('Error fetching game data.');
    }
  },

  async setGame(guildId, data) {
    try {
      await db.collection('games').doc(guildId).set(data);
    } catch (error) {
      console.error(`Firestore setGame error:`, error);
      throw new Error('Error saving game data.');
    }
  },

  async updateGame(guildId, data) {
    try {
      await db.collection('games').doc(guildId).update(data);
    } catch (error) {
      console.error(`Firestore updateGame error:`, error);
      throw new Error('Error updating game data.');
    }
  },

  async deleteGame(guildId) {
    try {
      await db.collection('games').doc(guildId).delete();
    } catch (error) {
      console.error(`Firestore deleteGame error:`, error);
      throw new Error('Error deleting game data.');
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
