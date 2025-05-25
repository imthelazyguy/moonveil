//File: /components/phaseManager.js

const { updateGameState, getGameState } = require('../utils/dbUtils');
const { generatePhaseEmbed } = require('../utils/embedUtils');
const { advanceDiscussion, handleNightActions, checkGameEnd } = require('../utils/gameUtils');

module.exports = {
  async nextPhase(interaction, gameId) {
    try {
      const state = await getGameState(gameId);
      const phaseOrder = ['setup', 'night', 'day', 'discussion', 'vote', 'end'];
      const currentIndex = phaseOrder.indexOf(state.phase);
      const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

      await updateGameState(gameId, { phase: nextPhase });

      if (nextPhase === 'discussion') await advanceDiscussion(interaction, gameId);
      else if (nextPhase === 'night') await handleNightActions(gameId);
      else if (nextPhase === 'end') await checkGameEnd(gameId);

      await interaction.followUp({
        embeds: [generatePhaseEmbed(nextPhase)],
        ephemeral: false
      });
    } catch (error) {
      console.error('PhaseManager Error:', error);
      await interaction.followUp({ content: 'Failed to change phase.', ephemeral: true });
    }
  }
};


**File: /components/interactionUtils.js**

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
