const { EmbedBuilder } = require('discord.js');

module.exports = {
  createGameStatusEmbed(game) {
    return new EmbedBuilder()
      .setTitle('Moonveil Game Status')
      .setColor(0x8A2BE2)
      .setDescription(`Phase: **${game.phase}**\nPlayers alive: ${game.alive.length}`)
      .setFooter({ text: `Round ${game.round}` });
  },

  loadingEmbed(text) {
    return new EmbedBuilder()
      .setTitle('Please wait...')
      .setDescription(`🕐 ${text}`)
      .setColor('Grey');
  },

  errorEmbed(errMsg) {
    return new EmbedBuilder()
      .setTitle('Something went wrong!')
      .setDescription(`❌ ${errMsg}`)
      .setColor('Red');
  }
};
