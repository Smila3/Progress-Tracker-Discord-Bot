const {SlashCommandBuilder} = require('discord.js')
const db = require('../../db');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('track-delete')
        .setDescription('Delete a previous log to correct a mistake/ update accuracy')
        .addIntegerOption(option =>
            option.setName('log-id')
            .setDescription('Enter Log ID of entry you wish to delete')
            .setRequired(true)
        ),
    
    async execute(interaction) {
        const userID = interaction.user.id;
        const logID = interaction.options.getInteger('log-id')

        //Check if user exists
        const existing = db.prepare(`SELECT 1 FROM users WHERE user_id = ?`).get(userID);
        //If the user doesn't exist, don't bother finding a log
        if(!existing){
            await interaction.reply(`Sorry, you're not in my records, so nothing to track for you.\nMaybe try adding some hours in the track new command first.`);
            return;
        }

        //Verify log belongs to user, so no sabotaging occurs
        //TODO, verify log belongs to guild
        const log = db.prepare(`SELECT * FROM activity_logs WHERE log_id = ?`).get(logID);
        if (!log) {
            await interaction.reply(`Log ID **${logID}** doesn't exist.`);
            return;
        }
        if (log.user_id !== userID) {
            await interaction.reply(`That log doesn't belong to you, so you can't delete it.`);
            return;
        }


        db.prepare(`
            DELETE FROM activity_logs WHERE log_id = ?`).run(logID

        );
        await interaction.reply(`Deleted entry **${logID}** for user <@${userID}> . `); //without the '@' it looked like they doxxed me
        

    }

}