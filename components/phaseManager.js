//File: /components/phaseManager.js

const { updateGameState, getGameState } = require('../utils/dbUtils');
const { generatePhaseEmbed } = require('../utils/embedUtils');
const { advanceDiscussion, handleNightActions, checkGameEnd } = require('../utils/gameUtils');

module.exports = {
  async nextPhase(interaction, gameId) {
    try {
      const state = await getGameState(gameId);
      const phaseOrder = ['setup', 'night', 'day', 'discussion', 'vote', 'end'];
      const currentIndex = phaseOrder.indexOf(state.phase);
      const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

      await updateGameState(gameId, { phase: nextPhase });

      if (nextPhase === 'discussion') await advanceDiscussion(interaction, gameId);
      else if (nextPhase === 'night') await handleNightActions(gameId);
      else if (nextPhase === 'end') await checkGameEnd(gameId);

      await interaction.followUp({
        embeds: [generatePhaseEmbed(nextPhase)],
        ephemeral: false
      });
    } catch (error) {
      console.error('PhaseManager Error:', error);
      await interaction.followUp({ content: 'Failed to change phase.', ephemeral: true });
    }
  }
};


**File: /components/interactionUtils.js**

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  createPowerUseEmbed(player, roleInfo) {
    const embed = new EmbedBuilder()
      .setTitle(`Your Power: ${roleInfo.name}`)
      .setDescription(roleInfo.description)
      .setColor('Purple')
      .setFooter({ text: 'Use your power wisely.' });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('power_use_confirm')
        .setLabel(`Use ${roleInfo.powerLabel}`)
        .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [actionRow] };
  },

  async sendPrivatePowerPrompt(client, player, roleInfo) {
    try {
      const user = await client.users.fetch(player.id);
      const { embeds, components } = this.createPowerUseEmbed(player, roleInfo);
      await user.send({ embeds, components });
    } catch (error) {
      console.error('Failed to send DM:', error);
    }
  }
};

Here are the remaining `/components/` files with full contextual clarity, interactive embed systems, and error handling:

---

### `/components/roleManager.js`
```js
const { EmbedBuilder } = require('discord.js');

const assignRoles = async (game, client) => {
  try {
    const shuffledPlayers = game.players.sort(() => Math.random() - 0.5);
    const roles = [...game.roles];

    for (let i = 0; i < shuffledPlayers.length; i++) {
      const member = await game.guild.members.fetch(shuffledPlayers[i]);
      const role = roles[i];
      game.playerData[member.id] = { role, alive: true, powerUsed: false };

      const embed = new EmbedBuilder()
        .setTitle(`Your Role: ${role.name}`)
        .setDescription(role.description)
        .addFields({ name: 'Allegiance', value: role.team, inline: true })
        .setColor(role.color || '#8b5cf6');

      if (role.image) embed.setThumbnail(role.image);

      await member.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[roleManager] Error assigning roles:', error);
  }
};

module.exports = { assignRoles };
```

---

### `/components/channelManager.js`
```js
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
```

---

### `/components/playerUtils.js`
```js
const getAlivePlayers = (game) => {
  return Object.entries(game.playerData)
    .filter(([_, data]) => data.alive)
    .map(([id]) => id);
};

const getTeamPlayers = (game, team) => {
  return Object.entries(game.playerData)
    .filter(([_, data]) => data.role.team === team && data.alive)
    .map(([id]) => id);
};

const markPlayerDead = (game, userId) => {
  if (game.playerData[userId]) {
    game.playerData[userId].alive = false;
  }
};

module.exports = {
  getAlivePlayers,
  getTeamPlayers,
  markPlayerDead,
};
```

---

Let me know if you want:
- Component files for managing voting, timers, sound/music playback
- Component files for managing interactive buttons and dropdowns (UIUtils)
- Game logic for each role’s action (actionManager)

I’ll continue the next batch upon confirmation!
