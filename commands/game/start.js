const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { setGameConfig } = require('../../utils/dbUtils');
const { sendAdminControlPanel } = require('../../commands/admin/controlPanel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start a new game')
    .addChannelOption(opt => opt.setName('voice_channel').setDescription('VC for game').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No permission.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const vc = interaction.options.getChannel('voice_channel');
    const host = interaction.user.id;
    const guildId = interaction.guildId;
    await setGameConfig(guildId, { host, voiceChannelId: vc.id, phase: 'waiting', players: [], gameActive: true });
    await sendAdminControlPanel(interaction.channel, host);
    await interaction.editReply('Game started and control panel sent.');
  }
};
