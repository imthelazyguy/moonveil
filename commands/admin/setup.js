// commands/admin/setup.js

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up Moonveil bot configuration')
    .addChannelOption(option =>
      option.setName('admin_channel')
        .setDescription('Text channel where admin control panel will be sent')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({ content: 'You need Administrator permission to run this command.', ephemeral: true });
      }

      const adminChannel = interaction.options.getChannel('admin_channel');
      const guildId = interaction.guild.id;

      await setGuildConfig(guildId, { adminChannelId: adminChannel.id });

      return await interaction.reply(`Admin channel has been set to ${adminChannel}.`);
    } catch (error) {
      console.error('Error in /setup command:', error);
      return await interaction.reply({ content: 'There was an error during setup.', ephemeral: true });
    }
  }
};
