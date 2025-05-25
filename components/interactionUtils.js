

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  createPowerUseEmbed(player, roleInfo) {
    const embed = new EmbedBuilder()
      .setTitle(`Your Power: ${roleInfo.name}`)
      .setDescription(roleInfo.description)
      .setColor('Purple')
      .setFooter({ text: 'Use your power wisely.' });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('power_use_confirm')
        .setLabel(`Use ${roleInfo.powerLabel}`)
        .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [actionRow] };
  },

  async sendPrivatePowerPrompt(client, player, roleInfo) {
    try {
      const user = await client.users.fetch(player.id);
      const { embeds, components } = this.createPowerUseEmbed(player, roleInfo);
      await user.send({ embeds, components });
    } catch (error) {
      console.error('Failed to send DM:', error);
    }
  }
};
