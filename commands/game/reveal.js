// commands/game/reveal.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRevealedInfo } = require('../../utils/dbUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reveal')
    .setDescription('Reveal night actions or votes'),

  async execute(interaction) {
    try {
      const results = await getRevealedInfo(interaction.guild.id);

      if (!results || results.length === 0) {
        return interaction.reply({ content: 'Nothing to reveal yet.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🕯️ Phase Outcome')
        .setDescription(results.map(r => `**${r.player}** was revealed as **${r.role}**.`).join('\n'))
        .setColor('#9b59b6');

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('[reveal.js] Error:', err);
      return interaction.reply({ content: '❌ Could not fetch reveal information.', ephemeral: true });
    }
  }
};
