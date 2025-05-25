// /commands/admin/controlPanel.js

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
  moveMemberToChannel,
  lockVoiceChannel,
  unlockVoiceChannel
} = require('../../utils/adminChannelUtils'); // or adminChannelVCUtils

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controlpanel')
    .setDescription('Open the admin control panel to manage voice & game phases'),
  async execute(interaction) {
    // 1) Permission check
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      interaction.member.id !== (await interaction.client.db
        .collection('games')
        .doc(interaction.guildId)
        .get())
        .data()?.host
    ) {
      return interaction.reply({
        content: 'Only the game host or an Administrator can use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // 2) Identify the game VC
      const gameVC = interaction.guild.channels.cache.find(ch =>
        ch.isVoiceBased() && ch.name.toLowerCase().includes('game')
      );
      if (!gameVC) {
        return interaction.editReply({
          content: 'Game voice channel not found. Please create or configure it.',
          ephemeral: true
        });
      }

      const voiceMembers = gameVC.members.filter(m => !m.user.bot);

      // 3) Build the panel embed & buttons
      const embed = new EmbedBuilder()
        .setTitle('🌕 Moonveil Admin Control Panel')
        .setDescription(`**Game Host:** <@${interaction.user.id}>\nManage voice & phase controls below.`)
        .setColor('#6A0DAD')
        .setFooter({ text: 'Buttons expire in 10 minutes.' })
        .setTimestamp();

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
          .setCustomId('start_phase')
          .setLabel('Start Phase')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next_phase')
          .setLabel('Next Phase')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('end_game')
          .setLabel('End Game')
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await interaction.editReply({
        embeds: [embed],
        components: [row1, row2]
      });

      // 4) Collector for button interactions
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 10 * 60 * 1000
      });

      collector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: 'Not your panel.', ephemeral: true });
        }
        await btn.deferUpdate();

        try {
          switch (btn.customId) {
            case 'mute_all':
              for (const [, m] of voiceMembers) await setMemberMute(m, true);
              await btn.followUp({ content: '✅ All muted.', ephemeral: true });
              break;
            case 'unmute_all':
              for (const [, m] of voiceMembers) await setMemberMute(m, false);
              await btn.followUp({ content: '✅ All unmuted.', ephemeral: true });
              break;
            case 'lock_vc':
              await lockVoiceChannel(gameVC);
              await btn.followUp({ content: '🔒 VC locked.', ephemeral: true });
              break;
            case 'unlock_vc':
              await unlockVoiceChannel(gameVC);
              await btn.followUp({ content: '🔓 VC unlocked.', ephemeral: true });
              break;
            case 'start_phase':
              // TODO: your phase start logic
              await btn.followUp({ content: '⏱️ Phase started.', ephemeral: true });
              break;
            case 'next_phase':
              // TODO: your phase advance logic
              await btn.followUp({ content: '➡️ Phase advanced.', ephemeral: true });
              break;
            case 'end_game':
              // TODO: your game end logic
              await btn.followUp({ content: '🛑 Game ended.', ephemeral: true });
              break;
            default:
              await btn.followUp({ content: 'Unknown action.', ephemeral: true });
          }
        } catch (err) {
          console.error('Control panel action error:', err);
          await btn.followUp({ content: 'Error executing action.', ephemeral: true });
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => null);
      });
    } catch (err) {
      console.error('Control panel setup error:', err);
      await interaction.editReply({ content: 'Failed to open panel.', ephemeral: true });
    }
  }
};
