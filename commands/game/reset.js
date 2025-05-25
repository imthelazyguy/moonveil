// commands/game/reset.js

const { SlashCommandBuilder } = require('discord.js');
const { resetGameData } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Admin only: Reset all game data'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this.', ephemeral: true });
    }

    try {
      await resetGameData(interaction.guild.id);
      return interaction.reply({ content: '✅ Game state reset successfully!' });
    } catch (err) {
      console.error('[reset.js] Error:', err);
      return interaction.reply({ content: '❌ Failed to reset game state.', ephemeral: true });
    }
  }
};
