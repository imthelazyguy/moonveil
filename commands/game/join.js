// commands/game/join.js 
const { SlashCommandBuilder } = require("@discordjs/builders"); const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js"); const { getGame, setGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("join") .setDescription("Join the current Moonveil game."),

aliases: ["j"],

async execute(interaction) { try { const game = await getGame(interaction.guild.id); if (!game || game.phase !== "lobby") { return interaction.reply({ embeds: [ new EmbedBuilder().setColor("Red").setTitle("No Game Lobby").setDescription("There is no active game lobby to join.") ], ephemeral: true }); }

if (game.players.includes(interaction.user.id)) {
    return interaction.reply({
      content: "You have already joined the game.",
      ephemeral: true
    });
  }

  game.players.push(interaction.user.id);
  await setGame(interaction.guild.id, game);

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("Joined Game")
        .setDescription(`<@${interaction.user.id}> has joined the game!`)
    ]
  });
} catch (error) {
  console.error("Error in join command:", error);
  return interaction.reply({
    content: "An error occurred while joining the game.",
    ephemeral: true
  });
}

}, };
