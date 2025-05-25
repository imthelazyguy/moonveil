const { PermissionsBitField } = require('discord.js');

async function lockVoiceChannel(vc) {
  await vc.permissionOverwrites.edit(vc.guild.roles.everyone, { Connect: false });
}

async function unlockVoiceChannel(vc) {
  await vc.permissionOverwrites.edit(vc.guild.roles.everyone, { Connect: true });
}

async function setMemberMute(member, mute) {
  if (!member.voice.channel) throw new Error('Not in VC');
  await member.voice.setMute(mute, mute ? 'Muted by admin' : 'Unmuted by admin');
}

module.exports = {
  lockVoiceChannel,
  unlockVoiceChannel,
  setMemberMute,
};
