// /components/adminChannelVCUtils.js

const { PermissionsBitField, EmbedBuilder } = require('discord.js');

/**
 * Mutes or unmutes a member in a voice channel.
 * @param {GuildMember} member - The member to mute/unmute.
 * @param {boolean} mute - True to mute, false to unmute.
 * @returns {Promise<void>}
 */
async function setMemberMute(member, mute) {
  try {
    if (!member.voice.channel) {
      throw new Error('Member is not connected to a voice channel.');
    }
    await member.voice.setMute(mute, mute ? 'Muted by game admin' : 'Unmuted by game admin');
  } catch (error) {
    console.error(`Failed to ${mute ? 'mute' : 'unmute'} member ${member.user.tag}:`, error);
    throw error;
  }
}

/**
 * Moves a member to a different voice channel.
 * @param {GuildMember} member - The member to move.
 * @param {VoiceChannel} targetChannel - The target voice channel.
 * @returns {Promise<void>}
 */
async function moveMemberToChannel(member, targetChannel) {
  try {
    if (!member.voice.channel) {
      throw new Error('Member is not connected to a voice channel.');
    }
    if (!targetChannel || targetChannel.type !== 2) { // 2 is VoiceChannel type
      throw new Error('Invalid target voice channel.');
    }
    await member.voice.setChannel(targetChannel, 'Moved by game admin');
  } catch (error) {
    console.error(`Failed to move member ${member.user.tag} to channel ${targetChannel?.name}:`, error);
    throw error;
  }
}

/**
 * Updates text channel permissions for a role or member.
 * @param {TextChannel} channel - The text channel to update.
 * @param {Role|GuildMember} target - Role or member to modify permissions for.
 * @param {Object} permissions - Permissions to allow/deny.
 * @returns {Promise<void>}
 */
async function updateTextChannelPermissions(channel, target, permissions) {
  try {
    await channel.permissionOverwrites.edit(target, permissions);
  } catch (error) {
    console.error(`Failed to update permissions in channel ${channel.name}:`, error);
    throw error;
  }
}

/**
 * Creates a standardized embed to confirm admin actions.
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
function createAdminActionEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor('#7289DA') // Discord blurple
    .setTimestamp();
}

module.exports = {
  setMemberMute,
  moveMemberToChannel,
  updateTextChannelPermissions,
  createAdminActionEmbed,
};
