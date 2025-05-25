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
