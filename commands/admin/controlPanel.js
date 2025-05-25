// commands/admin/controlpanel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGameByGuild } = require('../../utils/dbUtils');
const voiceUtils = require('../../utils/voiceUtils');

module.exports = {
  name: 'controlpanel',
  description: 'Open the admin control panel to mute/unmute players and manage VC.',
  aliases: ['cp', 'adminpanel'],
  usage: '/controlpanel',
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(interaction) {
    try {
      const guild = interaction.guild;
      const game = await getGameByGuild(guild.id);
      if (!game) return interaction.reply({ content: 'No active game in this server.', ephemeral: true });

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle('Moonveil Admin Control Panel')
        .setDescription('Use the buttons below to mute/unmute players, lock/unlock VC, or manage the game.')
        .setColor('#7289DA')
        .addFields(
          { name: 'Game Voice Channel', value: `<#${game.voiceChannelId}>`, inline: true },
          { name: 'Players', value: `${game.players.length}`, inline: true },
          { name: 'Game Phase', value: game.phase || 'Not started', inline: true }
        )
        .setFooter({ text: 'Control panel - Use responsibly' })
        .setTimestamp();

      // Buttons for admin actions
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mute_all')
          .setLabel('Mute All')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('unmute_all')
          .setLabel('Unmute All')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('lock_vc')
          .setLabel('Lock VC')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('unlock_vc')
          .setLabel('Unlock VC')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
    } catch (error) {
      console.error('controlpanel command error:', error);
      await interaction.reply({ content: 'An error occurred while opening control panel.', ephemeral: true });
    }
  },

  async handleButton(interaction) {
    try {
      const guild = interaction.guild;
      const game = await getGameByGuild(guild.id);
      if (!game) return interaction.reply({ content: 'No active game found.', ephemeral: true });

      switch (interaction.customId) {
        case 'mute_all':
          await voiceUtils.muteAllPlayers(guild, game);
          await interaction.update({ content: 'All players muted.', components: [], embeds: [] });
          break;

        case 'unmute_all':
          await voiceUtils.unmuteAllPlayers(guild, game);
          await interaction.update({ content: 'All players unmuted.', components: [], embeds: [] });
          break;

        case 'lock_vc':
          await voiceUtils.lockGameVC(guild, game);
          await interaction.update({ content: 'Game voice channel locked.', components: [], embeds: [] });
          break;

        case 'unlock_vc':
          await voiceUtils.unlockGameVC(guild, game);
          await interaction.update({ content: 'Game voice channel unlocked.', components: [], embeds: [] });
          break;

        default:
          await interaction.reply({ content: 'Unknown control action.', ephemeral: true });
      }
    } catch (error) {
      console.error('controlpanel button handler error:', error);
      await interaction.reply({ content: 'An error occurred while performing the action.', ephemeral: true });
    }
  }
};
