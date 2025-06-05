const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('bad-bot')
        .setDescription('For unexpected behaviour/feedback'),

    async execute(interaction){
        await interaction.reply("Oh no! I'm sorry😢\nPlease let my creator know on how I can improve"); //why am I feeling bad tf
    }

}