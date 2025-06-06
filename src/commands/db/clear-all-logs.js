//ONLY ADMIN
const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-all-logs')
        .setDescription('Delete every log in this server'

    ),
    
    async execute(interaction){

        if(interaction.member.permissions.has(PermissionFlagsBits.Administrator)){
            const guildID = interaction.guild.id;

            //NEED TO REFACTOR WITH GUILD IDS
            db.prepare(`DELETE FROM activity_logs`).run();
            console.log('I think db was deleted?');
            await interaction.reply('Logs Deleted');
        }

        else{
            await interaction.reply("I don't see your Admin badge🤨.\to delete your own logs please use '/track-delete' command.");
            return;
        }

    }
}
