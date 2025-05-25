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
