const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure Moonveil admin channel')
    .addChannelOption(opt => opt.setName('admin_channel').setDescription('Text channel for admin panel').setRequired(true).addChannelTypes(ChannelType.GuildText)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    const ch = interaction.options.getChannel('admin_channel');
    await setGuildConfig(interaction.guildId, { adminChannelId: ch.id });
    await interaction.reply(`Admin channel set to ${ch}.`);
  }
};
