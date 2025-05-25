// utils/gameUtils.js
const { db } = require("../firebase.js");
const { doc, getDoc, setDoc, updateDoc } = require("firebase/firestore");

module.exports = {
  async createGame(guildId, channelId, gameType, roles, adminId) {
    try {
      const gameRef = doc(db, "games", guildId);
      await setDoc(gameRef, {
        guildId,
        channelId,
        gameType,
        roles,
        adminId,
        status: "waiting",
        players: [],
        phase: "setup",
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error("[createGame] Error:", error);
      throw new Error("Failed to create game.");
    }
  },

  async getGame(guildId) {
    try {
      const gameRef = doc(db, "games", guildId);
      const snapshot = await getDoc(gameRef);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      console.error("[getGame] Error:", error);
      throw new Error("Failed to fetch game data.");
    }
  },

  async updateGame(guildId, data) {
    try {
      const gameRef = doc(db, "games", guildId);
      await updateDoc(gameRef, data);
    } catch (error) {
      console.error("[updateGame] Error:", error);
      throw new Error("Failed to update game state.");
    }
  },

  async addPlayerToGame(guildId, playerId) {
    try {
      const game = await this.getGame(guildId);
      if (!game) throw new Error("Game not found.");
      if (game.players.includes(playerId)) return;
      await this.updateGame(guildId, {
        players: [...game.players, playerId]
      });
    } catch (error) {
      console.error("[addPlayerToGame] Error:", error);
      throw new Error("Failed to add player.");
    }
  },

  async resetGame(guildId) {
    try {
      const gameRef = doc(db, "games", guildId);
      await setDoc(gameRef, {}, { merge: true });
    } catch (error) {
      console.error("[resetGame] Error:", error);
      throw new Error("Failed to reset game.");
    }
  }
};
