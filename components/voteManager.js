// components/voteManager.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dbUtils = require('../utils/dbUtils');

const activeVotes = new Map();

module.exports = {
  async initiateVote({ client, gameId, channel, players, voteType = 'elimination', duration = 30000 }) {
    try {
      const voteData = players.map(p => ({ userId: p.id, votes: 0 }));
      activeVotes.set(gameId, { voteType, voteData });

      const embed = new EmbedBuilder()
        .setTitle(`Vote Phase: ${voteType}`)
        .setDescription('Click the button below to vote for a player')
        .setColor('Yellow');

      const row = new ActionRowBuilder();
      players.forEach(p => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`vote_${p.id}`)
            .setLabel(p.username)
            .setStyle(ButtonStyle.Primary)
        );
      });

      const message = await channel.send({ embeds: [embed], components: [row] });

      setTimeout(async () => {
        const result = this.resolveVote(gameId);
        if (result) {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('Vote Result')
                .setDescription(`**${result.username}** received the most votes.`)
                .setColor('Red')
            ]
          });

          // Apply action if it's an elimination vote
          if (voteType === 'elimination') {
            await dbUtils.markPlayerEliminated(gameId, result.userId);
          }
        } else {
          await channel.send('No clear winner of the vote.');
        }

        activeVotes.delete(gameId);
      }, duration);
    } catch (error) {
      console.error('Error in initiateVote:', error);
    }
  },

  handleVoteInteraction(interaction) {
    try {
      const gameId = dbUtils.getGameIdFromChannel(interaction.channelId);
      const voteSession = activeVotes.get(gameId);
      if (!voteSession) return interaction.reply({ content: 'No active vote session.', ephemeral: true });

      const voterId = interaction.user.id;
      const targetId = interaction.customId.split('_')[1];

      // Prevent multiple votes
      const alreadyVoted = voteSession.voteData.some(p => p.votedBy?.includes(voterId));
      if (alreadyVoted) return interaction.reply({ content: 'You already voted!', ephemeral: true });

      const target = voteSession.voteData.find(p => p.userId === targetId);
      if (target) {
        target.votes++;
        target.votedBy = [...(target.votedBy || []), voterId];
        interaction.reply({ content: `Vote registered for <@${targetId}>`, ephemeral: true });
      } else {
        interaction.reply({ content: 'Invalid target.', ephemeral: true });
      }
    } catch (err) {
      console.error('Error in handleVoteInteraction:', err);
    }
  },

  resolveVote(gameId) {
    const voteSession = activeVotes.get(gameId);
    if (!voteSession) return null;

    const sorted = voteSession.voteData.sort((a, b) => b.votes - a.votes);
    if (sorted.length === 0 || sorted[0].votes === 0) return null;

    // Check for tie
    if (sorted.length > 1 && sorted[0].votes === sorted[1].votes) return null;

    return {
      userId: sorted[0].userId,
      username: sorted[0].username,
    };
  },
};
