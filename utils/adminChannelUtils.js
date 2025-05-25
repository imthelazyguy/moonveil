// /utils/adminChannelUtils.js

/**
 * Utilities for managing admin and game channels and voice channels,
 * including creating, locking, unlocking, muting, unmuting, and moving members.
 */

const { PermissionsBitField } = require('discord.js');

/**
 * Create a text channel with given permissions and category.
 * @param {Guild} guild 
 * @param {string} name 
 * @param {CategoryChannel} category 
 * @param {Object} overwrites 
 * @returns {Promise<TextChannel>}
 */
async function createTextChannel(guild, name, category, overwrites = []) {
  try {
    const channel = await guild.channels.create({
      name,
      type: 0, // GUILD_TEXT
      parent: category?.id,
      permissionOverwrites: overwrites,
    });
    return channel;
  } catch (error) {
    console.error(`Error creating text channel ${name}:`, error);
    throw error;
  }
}

/**
 * Create a voice channel with given permissions and category.
 * @param {Guild} guild 
 * @param {string} name 
 * @param {CategoryChannel} category 
 * @param {Object} overwrites 
 * @returns {Promise<VoiceChannel>}
 */
async function createVoiceChannel(guild, name, category, overwrites = []) {
  try {
    const channel = await guild.channels.create({
      name,
      type: 2, // GUILD_VOICE
      parent: category?.id,
      permissionOverwrites: overwrites,
    });
    return channel;
  } catch (error) {
    console.error(`Error creating voice channel ${name}:`, error);
    throw error;
  }
}

/**
 * Lock a voice channel (deny connect permission to @everyone)
 * @param {VoiceChannel} voiceChannel 
 */
async function lockVoiceChannel(voiceChannel) {
  try {
    await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
      Connect: false,
    });
  } catch (error) {
    console.error(`Error locking voice channel ${voiceChannel.name}:`, error);
    throw error;
  }
}

/**
 * Unlock a voice channel (allow connect permission to @everyone)
 * @param {VoiceChannel} voiceChannel 
 */
async function unlockVoiceChannel(voiceChannel) {
  try {
    await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
      Connect: true,
    });
  } catch (error) {
    console.error(`Error unlocking voice channel ${voiceChannel.name}:`, error);
    throw error;
  }
}

/**
 * Mute or unmute a member in a voice channel
 * @param {GuildMember} member 
 * @param {boolean} mute 
 */
async function setMemberMute(member, mute = true) {
  try {
    if (!member.voice.channel) throw new Error('Member is not in a voice channel');
    await member.voice.setMute(mute, mute ? 'Muted by game admin' : 'Unmuted by game admin');
  } catch (error) {
    console.error(`Error ${mute ? 'muting' : 'unmuting'} member ${member.user.tag}:`, error);
    throw error;
  }
}

/**
 * Deafen or undeafen a member in a voice channel
 * @param {GuildMember} member 
 * @param {boolean} deafen 
 */
async function setMemberDeafen(member, deafen = true) {
  try {
    if (!member.voice.channel) throw new Error('Member is not in a voice channel');
    await member.voice.setDeaf(deafen, deafen ? 'Deafened by game admin' : 'Undeafened by game admin');
  } catch (error) {
    console.error(`Error ${deafen ? 'deafening' : 'undeafening'} member ${member.user.tag}:`, error);
    throw error;
  }
}

/**
 * Move a member to another voice channel
 * @param {GuildMember} member 
 * @param {VoiceChannel} targetChannel 
 */
async function moveMemberToChannel(member, targetChannel) {
  try {
    if (!member.voice.channel) throw new Error('Member is not in a voice channel');
    await member.voice.setChannel(targetChannel);
  } catch (error) {
    console.error(`Error moving member ${member.user.tag} to ${targetChannel.name}:`, error);
    throw error;
  }
}

module.exports = {
  createTextChannel,
  createVoiceChannel,
  lockVoiceChannel,
  unlockVoiceChannel,
  setMemberMute,
  setMemberDeafen,
  moveMemberToChannel,
};
