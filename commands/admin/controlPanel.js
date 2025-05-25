// commands/admin/controlPanel.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getGameByGuild, updateGamePhase, mutePlayersInVC, unmutePlayersInVC } = require('../../utils/dbUtils');
const voiceUtils = require('../../utils/voiceUtils');
const balanceChecker = require('../../utils/balanceChecker');
const voteHandler = require('../../utils/voteHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controlpanel')
    .setDescription('Open the admin control panel for the game')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  aliases: ['cp', 'adminpanel'],
  async execute(interaction, client) {
    try {
      const game = await getGameByGuild(interaction.guild.id);
      if (!game) return interaction.reply({ content: 'No active game in this server.', ephemeral: true });

      // Embed showing game status and controls
      const embed = new EmbedBuilder()
        .setTitle('Moonveil Admin Control Panel')
        .setDescription(`Manage phases, voice chat and votes for the game.\n\n**Current Phase:** ${game.phase}`)
        .setColor('#7289DA')
        .setTimestamp();

      // Phase control buttons
      const phaseButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('phase_next')
            .setLabel('Next Phase')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(game.paused ? 'phase_resume' : 'phase_pause')
            .setLabel(game.paused ? 'Resume Game' : 'Pause Game')
            .setStyle(game.paused ? ButtonStyle.Success : ButtonStyle.Danger),
        );

      // Voice control select menu for muting/unmuting all or individual players
      const vcOptions = [
        { label: 'Mute All Players', value: 'mute_all' },
        { label: 'Unmute All Players', value: 'unmute_all' },
        { label: 'Mute Dead Players', value: 'mute_dead' },
        { label: 'Unmute Dead Players', value: 'unmute_dead' },
        { label: 'Lock VC', value: 'lock_vc' },
        { label: 'Unlock VC', value: 'unlock_vc' },
      ];
      // Add individual players dynamically (if needed)
      if (game.players && game.players.length > 0) {
        for (const p of game.players) {
          vcOptions.push({
            label: `Toggle Mute: ${p.username}`,
            value: `toggle_${p.id}`
          });
        }
      }

      const voiceControlMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('voice_control')
          .setPlaceholder('Select voice action...')
          .addOptions(vcOptions)
          .setMinValues(1)
          .setMaxValues(1),
      );

      // Vote control buttons
      const voteButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('force_vote')
          .setLabel('Force Vote Now')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('show_results')
          .setLabel('Show Vote Results')
          .setStyle(ButtonStyle.Success),
      );

      await interaction.reply({ embeds: [embed], components: [phaseButtons, voiceControlMenu, voteButtons], ephemeral: true });

      // Collector to handle button and select interactions
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });

      collector.on('collect', async i => {
        if (i.customId.startsWith('phase_')) {
          if (i.customId === 'phase_next') {
            await updateGamePhase(interaction.guild.id, 'next');
            await i.update({ content: 'Phase advanced to next.', components: [] });
          } else if (i.customId === 'phase_pause') {
            await updateGamePhase(interaction.guild.id, 'pause');
            await i.update({ content: 'Game paused.', components: [] });
          } else if (i.customId === 'phase_resume') {
            await updateGamePhase(interaction.guild.id, 'resume');
            await i.update({ content: 'Game resumed.', components: [] });
          }
          // Reload panel after update
          return interaction.followUp({ content: 'Reload the control panel to see updated status.', ephemeral: true });
        }

        if (i.customId === 'voice_control') {
          const val = i.values[0];
          if (val === 'mute_all') {
            await voiceUtils.muteAllPlayers(interaction.guild, game);
            await i.update({ content: 'All players muted in game VC.', components: [] });
          } else if (val === 'unmute_all') {
            await voiceUtils.unmuteAllPlayers(interaction.guild, game);
            await i.update({ content: 'All players unmuted in game VC.', components: [] });
          } else if (val === 'mute_dead') {
            await voiceUtils.muteDeadPlayers(interaction.guild, game);
            await i.update({ content: 'Dead players muted.', components: [] });
          } else if (val === 'unmute_dead') {
            await voiceUtils.unmuteDeadPlayers(interaction.guild, game);
            await i.update({ content: 'Dead players unmuted.', components: [] });
          } else if (val === 'lock_vc') {
            await voiceUtils.lockGameVC(interaction.guild, game);
            await i.update({ content: 'Game voice channel locked.', components: [] });
          } else if (val === 'unlock_vc') {
            await voiceUtils.unlockGameVC(interaction.guild, game);
            await i.update({ content: 'Game voice channel unlocked.', components: [] });
          } else if (val.startsWith('toggle_')) {
            const userId = val.split('_')[1];
            await voiceUtils.toggleMutePlayer(interaction.guild, userId, game);
            await i.update({ content: `Toggled mute for player <@${userId}>`, components: [] });
          } else {
            await i.update({ content: 'Unknown voice action.', components: [] });
          }
          return;
        }

        if (i.customId === 'force_vote') {
          await voteHandler.forceStartVote(interaction.guild.id);
          await i.update({ content: 'Forced voting phase started.', components: [] });
        }

        if (i.customId === 'show_results') {
          const results = await voteHandler.showVoteResults(interaction.guild.id);
          await i.update({ content: `Vote results:\n${results}`, components: [] });
        }
      });

      collector.on('end', () => {
        interaction.followUp({ content: 'Admin control panel session ended.', ephemeral: true });
      });
    } catch (err) {
      console.error('controlPanel.js error:', err);
      if (interaction.replied || interaction.deferred) {
        interaction.followUp({ content: 'An error occurred while opening control panel.', ephemeral: true });
      } else {
        interaction.reply({ content: 'An error occurred while opening control panel.', ephemeral: true });
      }
    }
  },
};
