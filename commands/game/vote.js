// commands/game/vote.js

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAlivePlayers, setVote, tallyVotes } = require('../../utils/dbUtils');
const { createLoadingEmbed } = require('../../utils/interactionUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Start the voting phase'),

  async execute(interaction, client) {
    try {
      const guildId = interaction.guild.id;
      const gameData = await getAlivePlayers(guildId);

      if (!gameData || gameData.length === 0) {
        return interaction.reply({ content: 'No alive players found!', ephemeral: true });
      }

      const loadingMsg = await interaction.reply({ embeds: [createLoadingEmbed('Starting vote phase...')], fetchReply: true });

      const embed = new EmbedBuilder()
        .setTitle('🗳️ Voting Phase')
        .setDescription('Click on a player to vote for them.\nYou can change your vote until time is up.')
        .setColor('#e74c3c');

      const rows = [];
      for (let i = 0; i < gameData.length; i += 5) {
        const row = new ActionRowBuilder();
        gameData.slice(i, i + 5).forEach(p => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`vote_${p.id}`)
              .setLabel(p.username)
              .setStyle(ButtonStyle.Secondary)
          );
        });
        rows.push(row);
      }

      await loadingMsg.edit({ embeds: [embed], components: rows });

      // Setup collector
      const collector = loadingMsg.createMessageComponentCollector({ time: 60000 });
      const votes = {};

      collector.on('collect', async i => {
        if (!gameData.find(p => p.id === i.user.id)) {
          return i.reply({ content: 'You are not alive in the game.', ephemeral: true });
        }

        const votedId = i.customId.split('_')[1];
        votes[i.user.id] = votedId;

        await i.reply({ content: `You voted for <@${votedId}>`, ephemeral: true });
      });

      collector.on('end', async () => {
        const result = await tallyVotes(guildId, votes);
        const tallyEmbed = new EmbedBuilder()
          .setTitle('📊 Voting Result')
          .setDescription(result.description)
          .setColor('#2ecc71');

        await loadingMsg.edit({ embeds: [tallyEmbed], components: [] });
      });

    } catch (err) {
      console.error('[vote.js] Error:', err);
      return interaction.reply({ content: '❌ An error occurred while starting the vote.', ephemeral: true });
    }
  }
};
