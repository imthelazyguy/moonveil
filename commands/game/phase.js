const { SlashCommandBuilder } = require('discord.js');
const { setGamePhase } = require('../../utils/gameUtils');
const emojis = require('../../assets/emojis');

module.exports = {
  name: 'phase',
  description: 'Change the game phase (Admin only).',
  aliases: ['setphase', 'advance'],
  data: new SlashCommandBuilder()
    .setName('phase')
    .setDescription('Change the game phase')
    .addStringOption(option =>
      option.setName('phase')
        .setDescription('Choose new phase')
        .setRequired(true)
        .addChoices(
          { name: 'Day', value: 'day' },
          { name: 'Night', value: 'night' },
          { name: 'Discussion', value: 'discussion' },
          { name: 'Voting', value: 'voting' }
        )
    ),

  async execute(message, args, client) {
    try {
      const phase = args[0];
      if (!phase) return message.reply(`${emojis.warn} Please specify the phase.`);
      await setGamePhase(phase, message.guild, client);
      message.channel.send(`${emojis.phase} Game phase changed to **${phase}**.`);
    } catch (error) {
      console.error('Phase command error:', error);
      message.reply(`${emojis.error} Could not change the game phase.`);
    }
  },

  async executeSlash(interaction, client) {
    try {
      const phase = interaction.options.getString('phase');
      await setGamePhase(phase, interaction.guild, client);
      await interaction.reply(`${emojis.phase} Game phase is now **${phase}**.`);
    } catch (error) {
      console.error('Phase Slash error:', error);
      await interaction.reply({ content: `${emojis.error} Failed to change phase.`, ephemeral: true });
    }
  },
};
