// commands/game/start.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayersInLobby, updatePlayerRole, createGameDoc } = require('../../utils/dbUtils');
const rolesConfig = require('../../config/roles.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start the Moonveil game and assign roles (host only)'),
  async execute(interaction, client) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      // Check if game already running
      const gameDoc = await client.db.collection('games').doc(guildId).get();
      if (gameDoc.exists) {
        return interaction.reply({ content: 'A game is already running in this server.', ephemeral: true });
      }

      // Get players in lobby
      const players = await getPlayersInLobby(client.db, guildId);
      if (players.length === 0) {
        return interaction.reply({ content: 'No players in lobby to start the game.', ephemeral: true });
      }

      // Check if user is host or assign host as command user
      // Create game doc with host and basic info
      await createGameDoc(client.db, guildId, userId);

      // Role assignment logic (copied from assignRoles.js)
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

      // Assign roles and mark players alive
      for (let i = 0; i < players.length; i++) {
        await updatePlayerRole(client.db, guildId, players[i].id, rolePool[i], true);
      }

      // DM players their roles
      for (const player of players) {
        try {
          const member = await interaction.guild.members.fetch(player.id);
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

      const embed = new EmbedBuilder()
        .setTitle('Game Started')
        .setDescription('Roles have been assigned and sent to players via DM. Let the game begin!')
        .setColor('#6a0dad')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in start command:', error);
      return interaction.reply({ content: 'An error occurred while starting the game.', ephemeral: true });
    }
  },
};
