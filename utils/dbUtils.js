// utils/dbUtils.js

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// ==================== GAME FUNCTIONS ==================== //

async function createGame(guildId, gameData) {
  try {
    await db.collection("games").doc(guildId).set(gameData);
  } catch (error) {
    console.error("[DB:createGame]", error);
    throw new Error("Failed to create game.");
  }
}

async function getGame(guildId) {
  try {
    const doc = await db.collection("games").doc(guildId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error("[DB:getGame]", error);
    throw new Error("Failed to get game data.");
  }
}

async function updateGame(guildId, updates) {
  try {
    await db.collection("games").doc(guildId).update(updates);
  } catch (error) {
    console.error("[DB:updateGame]", error);
    throw new Error("Failed to update game data.");
  }
}

async function deleteGame(guildId) {
  try {
    await db.collection("games").doc(guildId).delete();
  } catch (error) {
    console.error("[DB:deleteGame]", error);
    throw new Error("Failed to delete game data.");
  }
}

// ==================== PLAYER FUNCTIONS ==================== //

async function addPlayer(guildId, userId, playerData) {
  try {
    await db.collection("games").doc(guildId).collection("players").doc(userId).set(playerData);
  } catch (error) {
    console.error("[DB:addPlayer]", error);
    throw new Error("Failed to add player.");
  }
}

async function getPlayer(guildId, userId) {
  try {
    const doc = await db.collection("games").doc(guildId).collection("players").doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error("[DB:getPlayer]", error);
    throw new Error("Failed to get player data.");
  }
}

async function updatePlayer(guildId, userId, updates) {
  try {
    await db.collection("games").doc(guildId).collection("players").doc(userId).update(updates);
  } catch (error) {
    console.error("[DB:updatePlayer]", error);
    throw new Error("Failed to update player.");
  }
}

async function getAllPlayers(guildId) {
  try {
    const snapshot = await db.collection("games").doc(guildId).collection("players").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[DB:getAllPlayers]", error);
    throw new Error("Failed to fetch all players.");
  }
}

async function getPlayersByRole(guildId, role) {
  try {
    const players = await getAllPlayers(guildId);
    return players.filter(p => p.role === role);
  } catch (error) {
    console.error("[DB:getPlayersByRole]", error);
    throw new Error("Failed to get players by role.");
  }
}

// ==================== CHANNEL PERMISSIONS ==================== //

async function setupPermissionsForRoleChannels(client, guildId) {
  try {
    const game = await getGame(guildId);
    const guild = client.guilds.cache.get(guildId);
    if (!guild || !game) return;

    const players = await getAllPlayers(guildId);

    for (const role of game.roles) {
      const channelId = game.roleChannels[role];
      const channel = guild.channels.cache.get(channelId);
      if (!channel) continue;

      await channel.permissionOverwrites.set(
        players.map(player => {
          return {
            id: player.id,
            allow: player.role === role ? ["VIEW_CHANNEL", "SEND_MESSAGES"] : [],
            deny: player.role !== role ? ["VIEW_CHANNEL"] : []
          };
        })
      );
    }
  } catch (error) {
    console.error("[DB:setupPermissionsForRoleChannels]", error);
    throw new Error("Failed to set permissions for role channels.");
  }
}

module.exports = {
  createGame,
  getGame,
  updateGame,
  deleteGame,
  addPlayer,
  getPlayer,
  updatePlayer,
  getAllPlayers,
  getPlayersByRole,
  setupPermissionsForRoleChannels
};
