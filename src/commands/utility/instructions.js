const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('instructions')
        .setDescription('How to use the bot'),

    async execute(interaction){
        await interaction.reply("Hello! I can help you track your productive hours in the week and help you visualize your progress towards a goal.") //FINISH later
        await interaction.followUp("To get started, you can use the `/` command. You can also use `/help` to see a list of all available commands and their descriptions.");
    }

}