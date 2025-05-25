// components/admin/controlPanel.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  async sendAdminControlPanel(channel, hostId) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Moonveil: Admin Control Panel')
        .setDescription('Use the buttons below to control the game phases and player voice state.\n\n**Game Host:** <@' + hostId + '>')
        .setColor('#6A0DAD')
        .setFooter({ text: 'Only the game host or server admins can use these controls.' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('mute_all')
            .setLabel('Mute All')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔇'),

          new ButtonBuilder()
            .setCustomId('unmute_all')
            .setLabel('Unmute All')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🔊'),

          new ButtonBuilder()
            .setCustomId('start_phase')
            .setLabel('Start Phase')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⏱️'),

          new ButtonBuilder()
            .setCustomId('next_phase')
            .setLabel('Next Phase')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('➡️'),

          new ButtonBuilder()
            .setCustomId('end_game')
            .setLabel('End Game')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🛑'),
        );

      await channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Error sending admin control panel:', error);
    }
  }
};
