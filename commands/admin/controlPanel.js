const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ComponentType
} = require('discord.js');
const {
  setMemberMute,
  lockVoiceChannel,
  unlockVoiceChannel
} = require('../../utils/adminChannelUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controlpanel')
    .setDescription('Open the admin control panel to manage voice & game phases'),
  async execute(interaction) {
    const member = interaction.member;
    const gameDoc = await interaction.client.db.collection('games').doc(interaction.guildId).get();
    const hostId = gameDoc.exists ? gameDoc.data().host : null;
    if (
      !member.permissions.has(PermissionFlagsBits.Administrator) &&
      member.id !== hostId
    ) {
      return interaction.reply({ content: 'Only the host or an admin may use this.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const gameVC = interaction.guild.channels.cache.get(gameDoc.data().voiceChannelId);
    if (!gameVC || gameVC.type !== 2) {
      return interaction.editReply({ content: 'Game VC not found or is not a voice channel.', ephemeral: true });
    }
    const voiceMembers = gameVC.members.filter(m => !m.user.bot);

    const embed = new EmbedBuilder()
      .setTitle('🌕 Moonveil Admin Control Panel')
      .setDescription(`**Host:** <@${hostId}>\nManage voice & phases.`)
      .setColor('#6A0DAD')
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('mute_all').setLabel('Mute All').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('unmute_all').setLabel('Unmute All').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('lock_vc').setLabel('Lock VC').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('unlock_vc').setLabel('Unlock VC').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('start_phase').setLabel('Start Phase').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('next_phase').setLabel('Next Phase').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('end_game').setLabel('End Game').setStyle(ButtonStyle.Danger)
    );

    const msg = await interaction.editReply({ embeds: [embed], components: [row1, row2] });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });
    collector.on('collect', async btn => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({ content: 'Not authorized.', ephemeral: true });
      }
      await btn.deferUpdate();
      try {
        switch (btn.customId) {
          case 'mute_all':
            for (const m of voiceMembers.values()) await setMemberMute(m, true);
            await btn.followUp({ content: 'All muted.', ephemeral: true });
            break;
          case 'unmute_all':
            for (const m of voiceMembers.values()) await setMemberMute(m, false);
            await btn.followUp({ content: 'All unmuted.', ephemeral: true });
            break;
          case 'lock_vc':
            await lockVoiceChannel(gameVC);
            await btn.followUp({ content: 'VC locked.', ephemeral: true });
            break;
          case 'unlock_vc':
            await unlockVoiceChannel(gameVC);
            await btn.followUp({ content: 'VC unlocked.', ephemeral: true });
            break;
          case 'start_phase':
            await interaction.client.db.collection('games').doc(interaction.guildId).update({ phase: 'discussion' });
            await btn.followUp({ content: 'Discussion started.', ephemeral: true });
            break;
          case 'next_phase':
            await interaction.client.db.collection('games').doc(interaction.guildId).update({ phase: 'voting' });
            await btn.followUp({ content: 'Voting started.', ephemeral: true });
            break;
          case 'end_game':
            await interaction.client.db.collection('games').doc(interaction.guildId).update({ gameActive: false });
            await btn.followUp({ content: 'Game ended.', ephemeral: true });
            break;
        }
      } catch (e) {
        console.error(e);
        await btn.followUp({ content: 'Error executing action.', ephemeral: true });
      }
    });
    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  }
};
