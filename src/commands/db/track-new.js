const {SlashCommandBuilder} = require('discord.js');
const db = require('../../db');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('track-new')
        .setDescription('Track a new activity log')
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('What did you do? (e.g. "Coding", "Reading")')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('How many hours? (e.g. 2)')
                .setRequired(true)
        ),    
    

    
    async execute(interaction) { 
        const userId = interaction.user.id;
        const activity = interaction.options.getString('activity');
        const hours = interaction.options.getInteger('hours');

        // Check if user exists in the database
        const existing = db.prepare(`SELECT 1 FROM users WHERE user_id = ?`).get(userId);
        if (!existing) {
        db.prepare(`INSERT INTO users (user_id, dm_opt_in, created_at) VALUES (?, 0, ?)`)
            .run(userId, new Date().toISOString());
        }


        //Add activity log to database
        db.prepare(`
            INSERT INTO activity_logs (user_id, activity_type, hours, timestamp)
            VALUES (?, ?, ?, ?)`)
            .run(userId, activity, hours, new Date().toISOString());

        await interaction.reply(`Logged ${hours} hour(s) of **${activity}** for <@${userId}>.`);    
    }



}