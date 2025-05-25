// events/interaction/controlPanelButtons.js

const {
  Events,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const { customId, guild, member } = interaction;
    const gameRef = client.db.collection('games').doc(guild.id);
    const gameDoc = await gameRef.get();
    const gameData = gameDoc.exists ? gameDoc.data() : null;

    if (!gameData || gameData.hostId !== member.id) {
      return interaction.reply({
        content: 'You are not authorized to use this panel.',
        ephemeral: true
      });
    }

    const voiceChannel = guild.members.me.voice.channel;
    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      return interaction.reply({
        content: 'I must be in a voice channel to perform this action.',
        ephemeral: true
      });
    }

    try {
      switch (customId) {
        case 'mute_all': {
          for (const [id, member] of voiceChannel.members) {
            if (!member.user.bot) await member.voice.setMute(true);
          }
          await interaction.reply({ content: 'All players muted.', ephemeral: true });
          break;
        }
        case 'unmute_all': {
          for (const [id, member] of voiceChannel.members) {
            if (!member.user.bot) await member.voice.setMute(false);
          }
          await interaction.reply({ content: 'All players unmuted.', ephemeral: true });
          break;
        }
        case 'lock_vc': {
          await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            Speak: false
          });
          await interaction.reply({ content: 'Voice channel locked.', ephemeral: true });
          break;
        }
        case 'unlock_vc': {
          await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            Speak: true
          });
          await interaction.reply({ content: 'Voice channel unlocked.', ephemeral: true });
          break;
        }
        case 'start_discussion': {
          await gameRef.update({ phase: 'discussion' });
          await interaction.reply({ content: 'Discussion phase started.', ephemeral: true });
          break;
        }
        case 'start_rebuttal': {
          await gameRef.update({ phase: 'rebuttal' });
          await interaction.reply({ content: 'Rebuttal phase started.', ephemeral: true });
          break;
        }
        case 'start_vote': {
          await gameRef.update({ phase: 'voting' });
          await interaction.reply({ content: 'Voting phase started.', ephemeral: true });
          break;
        }
        default:
          await interaction.reply({ content: 'Unknown control action.', ephemeral: true });
      }
    } catch (err) {
      console.error('Control panel button error:', err);
      await interaction.reply({
        content: 'Something went wrong while executing that action.',
        ephemeral: true
      });
    }
  }
};
