const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('hello')
        .setDescription('Greet the bot'),

    async execute(interaction){
        await interaction.reply("Hello! 👋\nReady to log some hours for today✍️🕒?")
    }

}