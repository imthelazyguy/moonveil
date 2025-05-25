module.exports = {
  name: 'guildCreate',

  async execute(guild, client) {
    try {
      console.log(`[GUILD JOINED] ${guild.name} (${guild.id})`);
      const defaultChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
      if (defaultChannel) {
        defaultChannel.send({
          embeds: [{
            title: 'Thanks for adding Moonveil!',
            description: 'Use `/setup` to initialize the bot for Werewolf games.',
            color: 0x8A2BE2
          }]
        });
      }
    } catch (err) {
      console.error('Error in guildCreate event:', err);
    }
  },
};
