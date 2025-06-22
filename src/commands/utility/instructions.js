const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('instructions')
        .setDescription('How to use the bot'),

    async execute(interaction){
        await interaction.reply("Hello! I can help you track your productive hours in the week and help you visualize your progress towards a goal.\n") //FINISH later
        await interaction.followUp("To get started, you can use the `/track-new` command to enter an activity and the hours you dedicated to it today. \nThen you can use the `day-summ` command to visualize all of your logs today in a chart. \nYou can also use `/help` to see a list of all available commands and their descriptions.");
        await interaction.followUp("I mostly understand slash commands. Please refrain from asking me direct questions, as I am not a chatbot.")
    }

}