// commands/game/start.js

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { sendAdminControlPanel } = require('../../components/admin/controlPanel');
const { initializeGame } = require('../../components/game/gameInitializer');
const { setGameConfig } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start a new Werewolf game in this server')
    .addChannelOption(option =>
      option.setName('voice_channel')
        .setDescription('Voice channel where players will join')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),

  async execute(interaction) {
    try {
      const voiceChannel = interaction.options.getChannel('voice_channel');

      // Permission check
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return await interaction.reply({ content: 'You do not have permission to start a game.', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      // Set up game in database
      const hostId = interaction.user.id;
      const guildId = interaction.guild.id;

      await setGameConfig(guildId, {
        host: hostId,
        voiceChannelId: voiceChannel.id,
        phase: 'waiting',
        players: [],
        roles: [],
        votes: {},
        gameActive: true,
      });

      await initializeGame(interaction.guild, voiceChannel, hostId);

      // Send control panel
      await sendAdminControlPanel(interaction.channel, hostId);

      await interaction.editReply('Game setup is complete. Admin control panel sent.');
    } catch (error) {
      console.error('Error in /start command:', error);
      await interaction.editReply('An error occurred while starting the game.');
    }
  }
};
