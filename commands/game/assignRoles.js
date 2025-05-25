// commands/game/assignRoles.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayersInLobby, updatePlayerRole } = require('../../utils/dbUtils');
const rolesConfig = require('../../config/roles.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assignroles')
    .setDescription('Assign roles to all players in the lobby (host only)'),
  async execute(interaction, client) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      // Check if user is host
      const gameDoc = await client.db.collection('games').doc(guildId).get();
      if (!gameDoc.exists) {
        return interaction.reply({ content: 'No active game found in this server.', ephemeral: true });
      }
      const gameData = gameDoc.data();
      if (gameData.host !== userId) {
        return interaction.reply({ content: 'Only the game host can assign roles.', ephemeral: true });
      }

      // Get players in lobby
      const players = await getPlayersInLobby(client.db, guildId);
      if (players.length === 0) {
        return interaction.reply({ content: 'No players found in the lobby.', ephemeral: true });
      }

      // Shuffle players and assign roles randomly from rolesConfig
      // rolesConfig example: [{ "name": "Villager", "count": 3 }, { "name": "Werewolf", "count": 2 }]
      let rolePool = [];
      rolesConfig.forEach(role => {
        for (let i = 0; i < role.count; i++) {
          rolePool.push(role.name);
        }
      });

      if (rolePool.length !== players.length) {
        return interaction.reply({
          content: `Role counts (${rolePool.length}) do not match number of players (${players.length}). Adjust roles.json.`,
          ephemeral: true,
        });
      }

      // Shuffle rolePool
      for (let i = rolePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
      }

      // Assign roles
      for (let i = 0; i < players.length; i++) {
        await updatePlayerRole(client.db, guildId, players[i].id, rolePool[i]);
      }

      // Notify players privately about their role
      for (const player of players) {
        try {
          const member = await interaction.guild.members.fetch(player.id);
          const playerRole = rolePool.shift(); // Already assigned but we need role here again - slight fix:
          // Let's get the role from DB directly again:
          const playerDoc = await client.db
            .collection('games')
            .doc(guildId)
            .collection('players')
            .doc(player.id)
            .get();
          const assignedRole = playerDoc.data()?.role ?? 'Unknown';

          await member.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('Your Role in Moonveil')
                .setDescription(`You have been assigned the role **${assignedRole}**.`)
                .setColor('#6a0dad')
                .setFooter({ text: 'Keep it secret, keep it safe.' }),
            ],
          });
        } catch (dmError) {
          console.error(`Failed to DM player ${player.id}`, dmError);
        }
      }

      // Public confirmation embed
      const embed = new EmbedBuilder()
        .setTitle('Roles Assigned')
        .setDescription(`Roles have been assigned and sent via DM to all players.`)
        .setColor('#6a0dad')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error('Error in assignRoles command:', error);
      return interaction.reply({ content: 'An error occurred while assigning roles.', ephemeral: true });
    }
  },
};
