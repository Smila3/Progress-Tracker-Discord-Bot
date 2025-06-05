const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('good-bot')
        .setDescription('Thank the bot'),

    async execute(interaction){
        await interaction.reply("Glad to be of help! 😊");
    }

}