// roleManager.js
// Handles role assignment, role abilities and logic for Moonveil Werewolf bot

const dbUtils = require('./dbUtils');
const { MessageEmbed } = require('discord.js');

const ROLES = {
  VILLAGER: 'Villager',
  WEREWOLF: 'Werewolf',
  SEER: 'Seer',
  WITCH: 'Witch',
  HUNTER: 'Hunter',
  BODYGUARD: 'Bodyguard',
  // Add more roles here as needed
};

/**
 * Assign roles to players based on selected roles and player count.
 * Ensures fair distribution and fills with Villagers if needed.
 * @param {Array<string>} players - Player IDs
 * @param {Object} roleCounts - { Werewolf: 2, Seer: 1, Witch: 1, ... }
 * @returns {Object} Map of playerId -> role
 */
async function assignRoles(players, roleCounts) {
  try {
    const rolesArray = [];

    // Fill roles as per requested counts
    for (const [role, count] of Object.entries(roleCounts)) {
      for (let i = 0; i < count; i++) {
        rolesArray.push(role);
      }
    }

    // Fill remaining players as Villagers
    while (rolesArray.length < players.length) {
      rolesArray.push(ROLES.VILLAGER);
    }

    // Shuffle roles randomly
    for (let i = rolesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesArray[i], rolesArray[j]] = [rolesArray[j], rolesArray[i]];
    }

    // Map players to roles
    const playerRoles = {};
    for (let i = 0; i < players.length; i++) {
      playerRoles[players[i]] = rolesArray[i];
    }

    // Save to DB (if needed)
    // await dbUtils.setPlayerRoles(gameId, playerRoles);

    return playerRoles;
  } catch (error) {
    console.error('Error in assignRoles:', error);
    throw new Error('Role assignment failed.');
  }
}

/**
 * Get a descriptive embed for a player's role, sent privately.
 * Explains their abilities and win condition.
 * @param {string} role
 * @returns {MessageEmbed}
 */
function getRoleInfoEmbed(role) {
  const embed = new MessageEmbed()
    .setTitle(`Your Role: ${role}`)
    .setColor('PURPLE');

  switch (role) {
    case ROLES.VILLAGER:
      embed.setDescription(
        'You are a Villager. You have no special powers but your vote matters! ' +
        'Try to find and eliminate the Werewolves before they kill everyone.'
      );
      break;

    case ROLES.WEREWOLF:
      embed.setDescription(
        'You are a Werewolf. Your goal is to eliminate all Villagers. ' +
        'Each night, you will choose a victim to kill silently.'
      );
      break;

    case ROLES.SEER:
      embed.setDescription(
        'You are the Seer. Each night, you may peek at one player’s role to gather info. ' +
        'Use this wisely to help the Village.'
      );
      break;

    case ROLES.WITCH:
      embed.setDescription(
        'You are the Witch. You have two potions: one to save a victim, one to poison a player. ' +
        'You may use each potion once per game during the night.'
      );
      break;

    case ROLES.HUNTER:
      embed.setDescription(
        'You are the Hunter. If you die, you get to shoot and kill one player immediately.'
      );
      break;

    case ROLES.BODYGUARD:
      embed.setDescription(
        'You are the Bodyguard. Each night, you can protect one player from being killed.'
      );
      break;

    default:
      embed.setDescription(
        'Role information not found. Please contact the game admin.'
      );
  }

  embed.setFooter('Use your abilities wisely. Good luck!');
  return embed;
}

/**
 * Executes the ability of a role during the night phase.
 * This function is simplified and should be integrated with game state & interaction handlers.
 * @param {string} role
 * @param {string} userId - Player using ability
 * @param {string} targetId - Target player ID
 * @param {Object} gameState - The current game state object
 * @returns {Object} Updated gameState
 */
async function useRolePower(role, userId, targetId, gameState) {
  try {
    switch (role) {
      case ROLES.WEREWOLF:
        // Mark the target to be killed by werewolves this night
        gameState.nightKills = gameState.nightKills || [];
        gameState.nightKills.push(targetId);
        break;

      case ROLES.SEER:
        // Seer peeks at target role
        const targetRole = gameState.playerRoles[targetId];
        // Store info to reveal later privately to Seer
        gameState.seerVision = { seerId: userId, targetId, role: targetRole };
        break;

      case ROLES.WITCH:
        // Check potions availability
        if (!gameState.witchPotions) gameState.witchPotions = { save: true, poison: true };

        // Here, logic depends on player input whether save or poison potion used and target
        // For example, if save potion used:
        // gameState.nightKills = gameState.nightKills.filter(id => id !== targetId);
        // gameState.witchPotions.save = false;

        // If poison potion used:
        // gameState.nightKills.push(targetId);
        // gameState.witchPotions.poison = false;
        break;

      case ROLES.HUNTER:
        // When hunter dies, handle shooting logic in death phase
        break;

      case ROLES.BODYGUARD:
        // Protect a player from night kill
        gameState.protectedPlayer = targetId;
        break;

      default:
        // Villagers and others have no powers
        break;
    }

    return gameState;
  } catch (error) {
    console.error('Error in useRolePower:', error);
    throw new Error('Failed to use role power.');
  }
}

module.exports = {
  ROLES,
  assignRoles,
  getRoleInfoEmbed,
  useRolePower,
};
