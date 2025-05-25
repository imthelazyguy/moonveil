const { EmbedBuilder } = require('discord.js');


 //* Creates a standard Moonveil-styled embed.
 * @param {Object} options - Options for embed content.
 * @param {string} options.title - Title of the embed.
 * @param {string} options.description - Description or main content.
 * @param {string} [options.footer] - Optional footer text.
 * @param {string} [options.color] - Hex color (defaults to Moonveil purple).
 * @param {Array} [options.fields] - Optional array of fields [{ name, value, inline }]
 * @returns {EmbedBuilder}
 
function createEmbed({ title, description, footer, color = '#6D28D9', fields = [] }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  if (footer) embed.setFooter({ text: footer });
  if (fields.length > 0) embed.addFields(fields);

  return embed;
}


 //* Creates an error embed
 * @param {string} errorMessage
 * @returns {EmbedBuilder}
 
function errorEmbed(errorMessage) {
  return new EmbedBuilder()
    .setTitle('Something went wrong!')
    .setDescription(`**Error:** ${errorMessage}`)
    .setColor('#DC2626')
    .setTimestamp();
}

// Creates a success embed
 * @param {string} message
 * @returns {EmbedBuilder}
 
function successEmbed(message) {
  return new EmbedBuilder()
    .setTitle('Success!')
    .setDescription(message)
    .setColor('#10B981')
    .setTimestamp();
}


 //* Creates a loading-style embed using emoji animation
 * @param {string} message
 * @returns {EmbedBuilder}
 
function loadingEmbed(message = 'Loading...') {
  return new EmbedBuilder()
    .setTitle('Please wait')
    .setDescription(`⏳ ${message}`)
    .setColor('#FBBF24')
    .setTimestamp();
}

module.exports = {
  createEmbed,
  errorEmbed,
  successEmbed,
  loadingEmbed,
};
