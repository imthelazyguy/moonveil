// utils/voiceUtils.js
const { PermissionsBitField } = require('discord.js');
const { getGameByGuild, updatePlayerMuteStatus } = require('./dbUtils');

module.exports = {
  async muteAllPlayers(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      for (const player of game.players) {
        const member = await guild.members.fetch(player.id).catch(() => null);
        if (member && member.voice.channelId === vc.id) {
          await member.voice.setMute(true, 'Game admin muted all players');
          await updatePlayerMuteStatus(game.id, player.id, true);
        }
      }
    } catch (error) {
      console.error('muteAllPlayers error:', error);
      throw error;
    }
  },

  async unmuteAllPlayers(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      for (const player of game.players) {
        const member = await guild.members.fetch(player.id).catch(() => null);
        if (member && member.voice.channelId === vc.id) {
          await member.voice.setMute(false, 'Game admin unmuted all players');
          await updatePlayerMuteStatus(game.id, player.id, false);
        }
      }
    } catch (error) {
      console.error('unmuteAllPlayers error:', error);
      throw error;
    }
  },

  async muteDeadPlayers(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      for (const player of game.players) {
        if (player.status === 'dead') {
          const member = await guild.members.fetch(player.id).catch(() => null);
          if (member && member.voice.channelId === vc.id) {
            await member.voice.setMute(true, 'Game admin muted dead players');
            await updatePlayerMuteStatus(game.id, player.id, true);
          }
        }
      }
    } catch (error) {
      console.error('muteDeadPlayers error:', error);
      throw error;
    }
  },

  async unmuteDeadPlayers(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      for (const player of game.players) {
        if (player.status === 'dead') {
          const member = await guild.members.fetch(player.id).catch(() => null);
          if (member && member.voice.channelId === vc.id) {
            await member.voice.setMute(false, 'Game admin unmuted dead players');
            await updatePlayerMuteStatus(game.id, player.id, false);
          }
        }
      }
    } catch (error) {
      console.error('unmuteDeadPlayers error:', error);
      throw error;
    }
  },

  async lockGameVC(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      await vc.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: false,
      }, { reason: 'Game voice channel locked by admin' });
    } catch (error) {
      console.error('lockGameVC error:', error);
      throw error;
    }
  },

  async unlockGameVC(guild, game) {
    try {
      const vc = guild.channels.cache.get(game.voiceChannelId);
      if (!vc) throw new Error('Game voice channel not found.');

      await vc.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: null,
      }, { reason: 'Game voice channel unlocked by admin' });
    } catch (error) {
      console.error('unlockGameVC error:', error);
      throw error;
    }
  },

  async toggleMutePlayer(guild, userId, game) {
    try {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) throw new Error('Member not found.');

      if (member.voice.channelId !== game.voiceChannelId) throw new Error('Member not in game voice channel.');

      const isMuted = member.voice.serverMute;
      await member.voice.setMute(!isMuted, 'Toggled mute by admin via control panel');
      await updatePlayerMuteStatus(game.id, userId, !isMuted);
    } catch (error) {
      console.error('toggleMutePlayer error:', error);
      throw error;
    }
  },
};
