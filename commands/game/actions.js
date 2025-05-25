const { SlashCommandBuilder } = require('discord.js');
const { performAction } = require('../../utils/actionHandler');
const emojis = require('../../assets/emojis');

module.exports = {
  name: 'action',
  description: 'Use your role’s power in the current game phase.',
  aliases: ['use', 'ability'],
  data: new SlashCommandBuilder()
    .setName('action')
    .setDescription('Use your role’s power')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Choose a player to target')
        .setRequired(true)
    ),

  async execute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply(`${emojis.warn} Please mention a valid target.`);
      await performAction(message.author, target, message.guild, client);
    } catch (err) {
      console.error('Action command error:', err);
      return message.reply(`${emojis.error} Something went wrong while using your power.`);
    }
  },

  async executeSlash(interaction, client) {
    try {
      const target = interaction.options.getUser('target');
      await performAction(interaction.user, target, interaction.guild, client);
      await interaction.reply(`${emojis.magic} Your action has been performed on **${target.username}**.`);
    } catch (err) {
      console.error('Action Slash error:', err);
      await interaction.reply({ content: `${emojis.error} Failed to perform action.`, ephemeral: true });
    }
  },
};
