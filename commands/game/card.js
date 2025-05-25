// commands/game/card.js

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');
const { getPlayerData } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('card')
    .setDescription('Sends your role card with actions to your DM'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    try {
      const player = await getPlayerData(guildId, userId);
      if (!player || !player.role) {
        return interaction.reply({ content: 'You are not part of the current game.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🃏 Your Role: ${player.role.name}`)
        .setDescription(player.role.description)
        .addFields(
          { name: 'Alignment', value: player.role.alignment, inline: true },
          { name: 'Power', value: player.role.powerName || 'None', inline: true },
          { name: 'Cooldown', value: player.cooldown ? `${player.cooldown} turn(s)` : 'Ready', inline: true }
        )
        .setThumbnail(player.role.icon || interaction.user.displayAvatarURL())
        .setColor('#3498db')
        .setFooter({ text: 'Use your power wisely.' });

      const actionRow = new ActionRowBuilder();

      if (player.role.buttonLabel) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`usepower_${guildId}_${userId}`)
            .setLabel(player.role.buttonLabel)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!!player.cooldown)
        );
      }

      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`skip_${guildId}_${userId}`)
          .setLabel('Skip Turn')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.user.send({ embeds: [embed], components: [actionRow] });
      await interaction.reply({ content: 'Check your DMs for your role card.', ephemeral: true });

    } catch (err) {
      console.error('[card.js] Error:', err);
      return interaction.reply({ content: '❌ Unable to send your role card.', ephemeral: true });
    }
  }
};
