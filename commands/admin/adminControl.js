// /commands/admin/adminControl.js

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  StringSelectMenuBuilder,
} = require('discord.js');
const {
  setMemberMute,
  moveMemberToChannel,
  createAdminActionEmbed,
} = require('../../components/adminChannelVCUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admincontrol')
    .setDescription('Open the admin control panel to manage game phases, mute/unmute players, move players, and more.'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You need Administrator permissions to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;

      // TODO: Replace this with your real game VC channel ID or logic
      const gameVC = guild.channels.cache.find(
        (ch) => ch.isVoiceBased() && ch.name.toLowerCase().includes('game')
      );

      if (!gameVC) {
        return interaction.editReply({
          content: 'Game voice channel not found. Please create or configure it.',
          ephemeral: true,
        });
      }

      // Members connected to the game VC (non-bots)
      const voiceMembers = gameVC.members.filter((m) => !m.user.bot);

      // Example: Fetch current game phase from your DB
      let currentPhase = 'Discussion'; // Replace with actual DB call

      // Build main embed
      const embed = new EmbedBuilder()
        .setTitle('Moonveil Admin Control Panel')
        .setDescription(
          `Current Game Phase: **${currentPhase}**\n\n` +
            `Manage the players below with the buttons and select menu.`
        )
        .setColor('#5865F2')
        .setTimestamp();

      // Top buttons: Mute All, Unmute All, Next Phase
      const mainButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mute_all')
          .setLabel('Mute All')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('unmute_all')
          .setLabel('Unmute All')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('next_phase')
          .setLabel('Advance Phase')
          .setStyle(ButtonStyle.Primary)
      );

      // Generate buttons for each member to mute/unmute individually
      // Limit 5 per row max due to Discord limits
      const memberButtons = new ActionRowBuilder();
      let count = 0;
      for (const [memberId, member] of voiceMembers) {
        if (count >= 5) break; // max 5 buttons per row
        memberButtons.addComponents(
          new ButtonBuilder()
            .setCustomId(`toggle_mute_${memberId}`)
            .setLabel(
              `${member.voice.serverMute ? 'Unmute' : 'Mute'} ${member.user.username}`
            )
            .setStyle(member.voice.serverMute ? ButtonStyle.Success : ButtonStyle.Danger)
            .setEmoji(member.voice.serverMute ? '🔈' : '🔇')
        );
        count++;
      }

      // Create a dropdown to move members between voice channels
      // List all voice channels as options
      const voiceChannels = guild.channels.cache
        .filter((ch) => ch.isVoiceBased())
        .map((vc) => ({
          label: vc.name,
          value: vc.id,
          description: `Move selected players to ${vc.name}`,
        }));

      const moveSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('move_members_select')
        .setPlaceholder('Select a voice channel to move selected players')
        .addOptions(voiceChannels.slice(0, 25)); // max 25 options

      const moveRow = new ActionRowBuilder().addComponents(moveSelectMenu);

      // Send initial reply with embed, buttons, and select menu
      const msg = await interaction.editReply({
        embeds: [embed],
        components: [mainButtons, memberButtons, moveRow],
      });

      // To track selected members for moving
      let selectedMemberIds = new Set();

      // Collector for buttons and select menu
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15 * 60 * 1000, // 15 minutes
      });

      const selectCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15 * 60 * 1000,
      });

      collector.on('collect', async (btnInt) => {
        if (btnInt.user.id !== interaction.user.id) {
          return btnInt.reply({
            content: 'Only the original admin can use these controls.',
            ephemeral: true,
          });
        }

        await btnInt.deferUpdate();

        try {
          if (btnInt.customId === 'mute_all') {
            for (const [, member] of voiceMembers) {
              await setMemberMute(member, true);
            }
            await btnInt.followUp({ content: 'All players muted.', ephemeral: true });
          } else if (btnInt.customId === 'unmute_all') {
            for (const [, member] of voiceMembers) {
              await setMemberMute(member, false);
            }
            await btnInt.followUp({ content: 'All players unmuted.', ephemeral: true });
          } else if (btnInt.customId === 'next_phase') {
            // TODO: Advance game phase logic, update DB here
            currentPhase = 'Night'; // Example change
            // Update embed to reflect new phase
            embed.setDescription(
              `Current Game Phase: **${currentPhase}**\n\nManage the players below with the buttons and select menu.`
            );
            await msg.edit({ embeds: [embed] });
            await btnInt.followUp({
              content: 'Game phase advanced. (Update your DB logic here)',
              ephemeral: true,
            });
          } else if (btnInt.customId.startsWith('toggle_mute_')) {
            const memberId = btnInt.customId.replace('toggle_mute_', '');
            const member = guild.members.cache.get(memberId);
            if (!member) {
              return btnInt.followUp({ content: 'Member not found.', ephemeral: true });
            }
            const newMuteState = !member.voice.serverMute;
            await setMemberMute(member, newMuteState);
            await btnInt.followUp({
              content: `${member.user.username} has been ${
                newMuteState ? 'muted' : 'unmuted'
              }.`,
              ephemeral: true,
            });

            // Optionally update button label and style for the member
            // (Requires re-sending components, so skipped here for brevity)
          }
        } catch (err) {
          console.error('Error handling admin control button:', err);
          await btnInt.followUp({
            content: 'An error occurred executing this action.',
            ephemeral: true,
          });
        }
      });

      selectCollector.on('collect', async (selectInt) => {
        if (selectInt.user.id !== interaction.user.id) {
          return selectInt.reply({
            content: 'Only the original admin can use these controls.',
            ephemeral: true,
          });
        }

        await selectInt.deferUpdate();

        try {
          // The selected voice channel ID
          const targetChannelId = selectInt.values[0];
          const targetChannel = guild.channels.cache.get(targetChannelId);
          if (!targetChannel || !targetChannel.isVoiceBased()) {
            return selectInt.followUp({
              content: 'Selected channel is invalid or not a voice channel.',
              ephemeral: true,
            });
          }

          if (selectedMemberIds.size === 0) {
            return selectInt.followUp({
              content:
                'No members selected to move. Use the toggle mute buttons or implement member selection UI.',
              ephemeral: true,
            });
          }

          // Move selected members to target channel
          for (const memberId of selectedMemberIds) {
            const member = guild.members.cache.get(memberId);
            if (member && member.voice.channel) {
              await moveMemberToChannel(member, targetChannel);
            }
          }

          await selectInt.followUp({
            content: `Moved ${selectedMemberIds.size} member(s) to ${targetChannel.name}.`,
            ephemeral: true,
          });

          // Clear selection after move
          selectedMemberIds.clear();
        } catch (err) {
          console.error('Error moving members:', err);
          await selectInt.followUp({
            content: 'An error occurred while moving members.',
            ephemeral: true,
          });
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });
      selectCollector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('Error opening admin control panel:', error);
      interaction.editReply({
        content: 'Failed to open admin control panel. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
