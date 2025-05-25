const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  async sendPhaseEmbed(channel, title, description, footer = null) {
    try {
      const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`🌕 ${title}`)
        .setDescription(description)
        .setTimestamp();

      if (footer) embed.setFooter({ text: footer });

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("[interactionUtils.sendPhaseEmbed]", err);
    }
  },

  async sendActionPrompt(client, player, game, actionType = "target") {
    try {
      const user = await client.users.fetch(player.id);

      const embed = new EmbedBuilder()
        .setColor("DarkButNotBlack")
        .setTitle("🌑 Night Action")
        .setDescription(`You are the **${player.role}**. Choose your action target.`)
        .setFooter({ text: "Respond quickly before the night ends." });

      const targets = game.players.filter(
        (p) => p.id !== player.id && !p.isDead
      );

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`night_action_${game.guildId}_${player.id}`)
          .setPlaceholder("Select a target")
          .addOptions(
            targets.map((p) => ({
              label: p.username,
              value: p.id,
              description: `Target ${p.username}`,
            }))
          )
      );

      await user.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error("[interactionUtils.sendActionPrompt]", err);
    }
  },

  async sendAdminControls(channel, guildId) {
    try {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Game Phase Controls")
        .setDescription("Use the buttons below to manually control game phases.")
        .setFooter({ text: "Only visible to the host/admin." });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`start_discussion_${guildId}`)
          .setLabel("Start Discussion")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`start_voting_${guildId}`)
          .setLabel("Start Voting")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`start_night_${guildId}`)
          .setLabel("Start Night")
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error("[interactionUtils.sendAdminControls]", err);
    }
  }
};
