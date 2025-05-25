const controlPanel = require('../../commands/admin/controlpanel');
const helpCommand = require('../../commands/info/help');
// ... import other handlers as needed
const voteHandler = require('../../utils/voteHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // === BUTTON INTERACTIONS ===
      if (interaction.isButton()) {
        // Admin control panel buttons
        const adminIds = ['mute_all','unmute_all','lock_vc','unlock_vc','phase_next','phase_pause','phase_resume','force_vote','show_results'];
        if (adminIds.includes(interaction.customId)) {
          return controlPanel.handleButton(interaction);
        }
        // Other buttons...
      }

      // === SELECT MENU INTERACTIONS ===
      if (interaction.isStringSelectMenu()) {
        // Help menu
        if (interaction.customId === 'help_menu') {
          return helpCommand.handleSelect(interaction);
        }
        // Voice control menu handled in controlPanel
        if (interaction.customId.startsWith('voice_control')) {
          return controlPanel.handleSelect(interaction);
        }
        // Night action menu
        if (interaction.customId.startsWith('night_action_')) {
          return voteHandler.handleNightAction(interaction);
        }
        // Voting select menu...
      }

      // === SLASH COMMANDS ===
      if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;
        return cmd.execute(interaction, client);
      }
    } catch (err) {
      console.error('[interactionCreate]', err);
      const replyOptions = { content: '❌ An error occurred.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyOptions);
      } else {
        await interaction.reply(replyOptions);
      }
    }
  }
};
