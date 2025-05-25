
// commands/game/end.js 
const { SlashCommandBuilder } = require("@discordjs/builders"); const { EmbedBuilder } = require("discord.js"); const { deleteGame } = require("../../utils/dbUtils");

module.exports = { data: new SlashCommandBuilder() .setName("end") .setDescription("Force end the current Moonveil game."),

aliases: ["stop", "terminate"],

async execute(interaction) { try { await deleteGame(interaction.guild.id);

return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Red")
        .setTitle("Game Ended")
        .setDescription("The game has been ended by the admin.")
    ]
  });
} catch (error) {
  console.error("Error ending the game:", error);
  return interaction.reply({
    content: "An error occurred while ending the game.",
    ephemeral: true
  });
}

}, };
