const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // This file is now merged into controlPanel.js command collector
    // No separate handling needed here
  }
};
