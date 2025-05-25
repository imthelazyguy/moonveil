// commands/game/summary.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayersInLobby } = require('../../utils/dbUtils');
const { checkGameEnd } = require('../../utils/balanceChecker');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Show the game summary and winner (host only)'),
  async execute(interaction, client) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      const gameDoc = await client.db.collection('games').doc(guildId).get();
      if (!gameDoc.exists) {
        return interaction.reply({ content: 'No active game found in this server.', ephemeral: true });
      }
      const gameData = gameDoc.data();
      if (gameData.host !== userId) {
        return interaction.reply({ content: 'Only the game host can view the summary.', ephemeral: true });
      }

      const players = await getPlayersInLobby(client.db, guildId);

      const winner = checkGameEnd(players);
      if (!winner) {
        return interaction.reply({ content: 'The game is still ongoing.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Moonveil Game Summary')
        .setColor('#6a0dad')
        .addFields(
          { name: 'Winner', value: winner, inline: false },
          {
            name: 'Players & Roles',
            value: players
              .map(p => `<@${p.id}> - ${p.role} - ${p.alive ? 'Alive' : 'Dead'}`)
              .join('\n'),
          },
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in summary command:', error);
      return interaction.reply({ content: 'An error occurred while fetching summary.', ephemeral: true });
    }
  },
};
