const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Initial server setup for Moonveil.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  name: 'setup',
  aliases: ['initialize'],
  async execute(interaction, client) {
    try {
      await interaction.reply({ content: 'Setting up the Moonveil game server...', ephemeral: true });

      const guild = interaction.guild;
      const existingRole = guild.roles.cache.find(r => r.name === 'Moonveil Host');
      const hostRole = existingRole || await guild.roles.create({ name: 'Moonveil Host', color: 'DarkPurple' });

      const category = await guild.channels.create({
        name: 'Moonveil Game',
        type: 4, // GUILD_CATEGORY
      });

      const channels = [
        { name: 'moonveil-game-chat', type: 0 },
        { name: 'moonveil-admin', type: 0 },
        { name: 'moonveil-voice', type: 2 },
      ];

      for (const ch of channels) {
        await guild.channels.create({
          name: ch.name,
          type: ch.type,
          parent: category.id,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: ['ViewChannel'],
            },
            {
              id: hostRole.id,
              allow: ['ViewChannel'],
            }
          ],
        });
      }

      await client.db.collection('configs').doc(guild.id).set({
        hostRoleId: hostRole.id,
        categoryId: category.id,
        setupComplete: true
      });

      const embed = new EmbedBuilder()
        .setColor(0x6b5b95)
        .setTitle('Moonveil Setup Complete')
        .setDescription('Server is ready! Use `/start` to begin a new game.')
        .setFooter({ text: 'Let the night unfold...' });

      await interaction.editReply({ content: '', embeds: [embed] });
    } catch (err) {
      console.error('Setup Error:', err);
      await interaction.followUp({ content: 'An error occurred during setup.', ephemeral: true });
    }
  }
};
