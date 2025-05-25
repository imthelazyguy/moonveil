const { PermissionFlagsBits } = require('discord.js');

const createGameChannels = async (guild, gameId, roles) => {
  try {
    const category = await guild.channels.create({
      name: `Moonveil-${gameId}`,
      type: 4,
    });

    const channels = {};

    // Create public game chat
    channels.public = await guild.channels.create({
      name: `game-chat-${gameId}`,
      type: 0,
      parent: category.id,
    });

    // Create dead chat
    channels.dead = await guild.channels.create({
      name: `dead-chat-${gameId}`,
      type: 0,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      ],
    });

    // Create role-based secret chats
    for (const role of roles) {
      if (role.hasPrivateChannel) {
        const chan = await guild.channels.create({
          name: `${role.name.toLowerCase().replace(/\s+/g, '-')}-${gameId}`,
          type: 0,
          parent: category.id,
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          ],
        });
        channels[role.name] = chan;
      }
    }

    return { category, channels };
  } catch (err) {
    console.error('[channelManager] Error creating game channels:', err);
    throw err;
  }
};

module.exports = { createGameChannels };
