module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: 'Unknown command.', ephemeral: true });

    try {
      await command.executeSlash(interaction, client);
    } catch (error) {
      console.error('Error in slash command:', error);
      interaction.reply({ content: 'Something went wrong while executing this command.', ephemeral: true });
    }
  },
};
