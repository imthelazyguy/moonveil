module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    try {
      console.log(`[READY] Logged in as ${client.user.tag}`);
      client.user.setPresence({
        activities: [{ name: 'Moonveil Games', type: 'WATCHING' }],
        status: 'online',
      });
    } catch (err) {
      console.error('Error in ready event:', err);
    }
  },
};
