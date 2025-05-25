// votingManager.js
// Manages voting phases, embeds, buttons, and vote tallying for Moonveil game

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

/**
 * Creates and returns a voting embed for a given phase.
 * @param {string} phase - e.g. 'Day', 'Night'
 * @param {Array} candidates - array of player objects { id, username }
 * @param {number} durationSeconds - voting duration
 * @returns {MessageEmbed}
 */
function createVotingEmbed(phase, candidates, durationSeconds) {
  const embed = new MessageEmbed()
    .setTitle(`${phase} Voting`)
    .setDescription(
      `Vote for the player you want to ${phase === 'Day' ? 'lynch' : 'target'}.\n` +
      `Voting ends in ${durationSeconds} seconds.\n\n` +
      'Candidates:\n' +
      candidates.map(p => `- ${p.username}`).join('\n')
    )
    .setColor(phase === 'Day' ? 'ORANGE' : 'DARK_RED')
    .setFooter({ text: 'Click a button below to cast your vote.' });

  return embed;
}

/**
 * Generates voting buttons for candidates.
 * @param {Array} candidates - array of player objects { id, username }
 * @returns {MessageActionRow}
 */
function createVotingButtons(candidates) {
  const row = new MessageActionRow();

  candidates.forEach(player => {
    row.addComponents(
      new MessageButton()
        .setCustomId(`vote_${player.id}`)
        .setLabel(player.username)
        .setStyle('PRIMARY')
    );
  });

  return row;
}

/**
 * Tallies votes from collected interaction data.
 * @param {Array} collectedInteractions - array of interaction objects with user and customId
 * @returns {Object} voteCounts - { playerId: voteCount }
 */
function tallyVotes(collectedInteractions) {
  const voteCounts = {};

  // Only count the last vote of each voter (unique by userId)
  const latestVotes = new Map(); // userId -> voted playerId
  collectedInteractions.forEach(interaction => {
    const voterId = interaction.user.id;
    const targetId = interaction.customId.split('_')[1];
    latestVotes.set(voterId, targetId);
  });

  for (const votedPlayer of latestVotes.values()) {
    voteCounts[votedPlayer] = (voteCounts[votedPlayer] || 0) + 1;
  }

  return voteCounts;
}

/**
 * Finds the player(s) with the highest votes.
 * @param {Object} voteCounts - { playerId: count }
 * @returns {Array} array of playerId(s) with max votes (tie possible)
 */
function findTopVoted(voteCounts) {
  let maxVotes = 0;
  const topPlayers = [];

  for (const [playerId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      topPlayers.length = 0; // clear
      topPlayers.push(playerId);
    } else if (count === maxVotes) {
      topPlayers.push(playerId);
    }
  }

  return topPlayers;
}

/**
 * Sends voting message with embed and buttons, collects votes, and returns the results.
 * @param {Object} channel - Discord text channel to send voting message
 * @param {string} phase - 'Day' or 'Night'
 * @param {Array} candidates - array of player objects { id, username }
 * @param {number} durationSeconds - voting duration
 * @param {Client} client - Discord Client (needed for collectors)
 * @returns {Promise<Object>} result with { voteCounts, topPlayers }
 */
async function startVoting(channel, phase, candidates, durationSeconds, client) {
  try {
    if (!channel) throw new Error('No channel provided for voting.');

    const embed = createVotingEmbed(phase, candidates, durationSeconds);
    const buttons = createVotingButtons(candidates);

    const votingMessage = await channel.send({ embeds: [embed], components: [buttons] });

    const filter = i => i.customId.startsWith('vote_') && candidates.some(c => `vote_${c.id}` === i.customId);

    const collector = votingMessage.createMessageComponentCollector({
      filter,
      time: durationSeconds * 1000,
    });

    const interactions = [];

    collector.on('collect', async i => {
      try {
        // Acknowledge interaction and respond ephemerally
        await i.deferUpdate();
        interactions.push(i);
      } catch (err) {
        console.error('Error responding to vote interaction:', err);
      }
    });

    await new Promise(resolve => collector.on('end', resolve));

    const voteCounts = tallyVotes(interactions);
    const topPlayers = findTopVoted(voteCounts);

    // Disable buttons after voting
    const disabledRow = new MessageActionRow().addComponents(
      buttons.components.map(btn => btn.setDisabled(true))
    );

    await votingMessage.edit({ components: [disabledRow] });

    return { voteCounts, topPlayers };
  } catch (error) {
    console.error('Error in startVoting:', error);
    throw error;
  }
}

module.exports = {
  createVotingEmbed,
  createVotingButtons,
  tallyVotes,
  findTopVoted,
  startVoting,
};
