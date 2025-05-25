const { SlashCommandBuilder } = require('discord.js');
const { startGame } = require('../../utils/gameUtils');
const emojis = require('../../assets/emojis');

module.exports = {
  name: 'start',
  description: 'Start a new Moonveil game.',
  aliases: ['begin', 'init'],
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start a new Moonveil game'),

  async execute(message, args, client) {
    try {
      await startGame(message, client);
    } catch (error) {
      console.error('Start command error:', error);
      return message.reply(`${emojis.error} Failed to start the game.`);
    }
  },

  async executeSlash(interaction, client) {
    try {
      await startGame(interaction, client);
    } catch (error) {
      console.error('Start Slash error:', error);
      return interaction.reply({ content: `${emojis.error} Could not start the game.`, ephemeral: true });
    }
  },
};
