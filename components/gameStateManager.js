// This module manages the core game state stored in Firestore.
// It handles game phases, players' roles, votes, and overall progress.

const { Timestamp } = require('firebase-admin/firestore');

class GameStateManager {
  /**
   * @param {FirebaseFirestore.Firestore} db - Firestore instance
   * @param {string} guildId - Discord server ID
   */
  constructor(db, guildId) {
    this.db = db;
    this.guildId = guildId;
    this.gameDocRef = this.db.collection('games').doc(guildId);
  }

  // Initialize a new game document in Firestore
  async createNewGame(initialData = {}) {
    try {
      const defaultData = {
        phase: 'setup',         // current phase: setup, discussion, night, voting, etc.
        players: {},            // playerId => { role, alive, data }
        votes: {},              // voterId => targetId
        phaseStart: Timestamp.now(),
        gameSettings: {},       // custom game settings
        ...initialData,
      };
      await this.gameDocRef.set(defaultData);
      return defaultData;
    } catch (error) {
      console.error('Failed to create new game:', error);
      throw error;
    }
  }

  // Fetch current game state snapshot
  async getGameState() {
    try {
      const doc = await this.gameDocRef.get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }

  // Update specific keys in game document atomically
  async updateGameState(updates) {
    try {
      await this.gameDocRef.update(updates);
    } catch (error) {
      console.error('Failed to update game state:', error);
      throw error;
    }
  }

  // Add or update a player in the game
  async setPlayer(playerId, playerData) {
    try {
      await this.gameDocRef.update({
        [`players.${playerId}`]: playerData,
      });
    } catch (error) {
      console.error(`Failed to set player ${playerId}:`, error);
      throw error;
    }
  }

  // Remove a player from the game
  async removePlayer(playerId) {
    try {
      await this.gameDocRef.update({
        [`players.${playerId}`]: null,
      });
    } catch (error) {
      console.error(`Failed to remove player ${playerId}:`, error);
      throw error;
    }
  }

  // Set current game phase and update phase start timestamp
  async setPhase(phaseName) {
    try {
      await this.gameDocRef.update({
        phase: phaseName,
        phaseStart: Timestamp.now(),
        votes: {}, // reset votes on new phase
      });
    } catch (error) {
      console.error('Failed to set phase:', error);
      throw error;
    }
  }

  // Register a vote from voterId targeting targetId
  async setVote(voterId, targetId) {
    try {
      await this.gameDocRef.update({
        [`votes.${voterId}`]: targetId,
      });
    } catch (error) {
      console.error(`Failed to register vote by ${voterId}:`, error);
      throw error;
    }
  }

  // Clear all votes
  async clearVotes() {
    try {
      await this.gameDocRef.update({ votes: {} });
    } catch (error) {
      console.error('Failed to clear votes:', error);
      throw error;
    }
  }
}

module.exports = GameStateManager;
