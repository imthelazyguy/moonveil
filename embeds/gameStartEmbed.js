const { EmbedBuilder } = require('discord.js');

const startGameEmbed = () => new EmbedBuilder()
  .setTitle('Werewolf Game Started')
  .setDescription('The game has begun! Roles have been distributed.')
  .setColor('DarkPurple')
  .setTimestamp();

const nightPhaseEmbed = () => new EmbedBuilder()
  .setTitle('Night Phase')
  .setDescription('Everyone is asleep. Special roles, take your actions.')
  .setColor('DarkGrey')
  .setTimestamp();

const dayPhaseEmbed = () => new EmbedBuilder()
  .setTitle('Day Phase')
  .setDescription('Time to discuss and vote out a suspect!')
  .setColor('Yellow')
  .setTimestamp();

const gameOverEmbed = (winner) => new EmbedBuilder()
  .setTitle('Game Over')
  .setDescription(`${winner} have won the game!`)
  .setColor('Green')
  .setTimestamp();

module.exports = {
  startGameEmbed,
  nightPhaseEmbed,
  dayPhaseEmbed,
  gameOverEmbed,
};
