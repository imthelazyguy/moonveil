const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('./embedUtils');

/**
 * Sends an interactive role card as DM
 * @param {User} user - Discord user
 * @param {Object} role - Role data
 * @param {Client} client - Discord client
 */
async function sendRoleCard(user, role, client) {
  try {
    const embed = createEmbed({
      title: `You are the **${role.name}**`,
      description: role.description,
      footer: `Alignment: ${role.alignment} | Moonveil`,
      color: role.color || '#6D28D9',
      fields: role.abilities ? role.abilities.map(a => ({ name: a.name, value: a.description })) : [],
    });

    const actionRow = new ActionRowBuilder();

    // Add buttons for each action if present
    if (role.actions && role.actions.length > 0) {
      for (const action of role.actions) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`usepower_${action.id}`)
            .setLabel(action.label)
            .setStyle(ButtonStyle.Primary)
        );
      }
    }

    const dm = await user.createDM();

    // Send DM with embed and buttons if any
    await dm.send({
      content: `Welcome to Moonveil, ${user.username}! Here's your role card:`,
      embeds: [embed],
      components: role.actions?.length > 0 ? [actionRow] : [],
    });
  } catch (err) {
    console.error(`Error sending role card to ${user.username}:`, err);
    const fallback = await user.createDM();
    await fallback.send('Something went wrong displaying your card. Please contact the host.');
  }
}

module.exports = {
  sendRoleCard,
};
