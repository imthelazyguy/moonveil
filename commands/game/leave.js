// commands/game/leave.js 
const { SlashCommandBuilder } = require("@discordjs/builders"); const { EmbedBuilder } = require("discord.js"); const { getGame, setGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("leave") .setDescription("Leave the Moonveil game."),

aliases: ["l"],

async execute(interaction) { try { const game = await getGame(interaction.guild.id); if (!game || game.phase !== "lobby") { return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("No Game Lobby").setDescription("There's no game to leave.")], ephemeral: true }); }

if (!game.players.includes(interaction.user.id)) {
    return interaction.reply({
      content: "You're not in the game.",
      ephemeral: true
    });
  }

  game.players = game.players.filter(p => p !== interaction.user.id);
  await setGame(interaction.guild.id, game);

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Orange")
        .setTitle("Left Game")
        .setDescription(`<@${interaction.user.id}> has left the game.`)
    ]
  });
} catch (error) {
  console.error("Error in leave command:", error);
  return interaction.reply({
    content: "An error occurred while leaving the game.",
    ephemeral: true
  });
}

}, };
