const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View help for Moonveil commands.'),
  name: 'help',
  aliases: ['commands'],
  async execute(interaction) {
    const helpOptions = new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('Choose a category to learn more')
      .addOptions([
        { label: 'Game Commands', description: 'Start and manage games', value: 'game' },
        { label: 'Admin Setup', description: 'Server setup and management', value: 'admin' },
        { label: 'Role Lore', description: 'Descriptions of roles and abilities', value: 'roles' },
      ]);

    const row = new ActionRowBuilder().addComponents(helpOptions);

    const embed = new EmbedBuilder()
      .setColor(0x6b5b95)
      .setTitle('Moonveil Help Menu')
      .setDescription('Select a category from the dropdown below.')
      .setFooter({ text: 'Mystery, Deceit, Survival.' });

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
