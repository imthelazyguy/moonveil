// commands/admin/controlPanel.js

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: {
    name: 'controlpanel',
    description: 'Display the control panel for managing voice & game phases',
  },
  async execute(interaction, client) {
    try {
      // Check if the user is the host or has Admin perms
      const member = interaction.member;
      if (
        !member.permissions.has(PermissionFlagsBits.Administrator) &&
        !await client.db.collection('games').doc(interaction.guildId).get().then(doc => doc.exists && doc.data().hostId === member.id)
      ) {
        return interaction.reply({
          content: 'Only the game host or an admin can use this command.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Moonveil Game Control Panel')
        .setDescription('Manage voice channel and game phases with the buttons below.')
        .setColor(0x6a0dad)
        .setFooter({ text: 'Only visible to the host or admins.' });

      const row1 = new ActionRowBuilder().addComponents(
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
          .setStyle(ButtonStyle.Primary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start_discussion')
          .setLabel('Start Discussion')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('start_rebuttal')
          .setLabel('Start Rebuttal')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('start_vote')
          .setLabel('Start Voting')
          .setStyle(ButtonStyle.Success)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true,
      });
    } catch (err) {
      console.error('Control panel error:', err);
      await interaction.reply({
        content: 'There was an error while trying to open the control panel.',
        ephemeral: true,
      });
    }
  }
};
