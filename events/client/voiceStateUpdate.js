module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState, client) {
    try {
      const userId = newState.id;
      const oldChannel = oldState.channelId;
      const newChannel = newState.channelId;

      if (!oldChannel && newChannel) {
        console.log(`[VOICE JOIN] ${userId} joined ${newChannel}`);
      } else if (oldChannel && !newChannel) {
        console.log(`[VOICE LEAVE] ${userId} left ${oldChannel}`);
      } else if (oldChannel !== newChannel) {
        console.log(`[VOICE SWITCH] ${userId} moved from ${oldChannel} to ${newChannel}`);
      }

      // Can be used for auto mute/deafen/unmute logic during game
    } catch (error) {
      console.error('voiceStateUpdate error:', error);
    }
  },
};
