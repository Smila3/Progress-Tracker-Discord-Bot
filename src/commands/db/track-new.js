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
        let activity = interaction.options.getString('activity');
        //Normalizing activity string to avoid reiteration:
        activity = activity.toLowerCase();
        activity = activity.charAt(0).toUpperCase() + activity.slice(1);

        const hours = interaction.options.getInteger('hours');
        const todayStr = new Date().toISOString().slice(0, 10);

        //Ensure user is not entering more than 24 hours in activities today
        const totalToday = db.prepare(`
            SELECT SUM(hours) AS total 
            FROM activity_logs 
            WHERE user_id = ? AND DATE(timestamp) = ?
        `).get(userId, todayStr)?.total || 0;

        if (totalToday + hours > 24) {
            await interaction.reply(`You’ve already logged ${totalToday}h today. You can't log more than 24 hours in a single day!`);
            return;
        }

        

        // Check if user exists in the database
        const existing = db.prepare(`SELECT 1 FROM users WHERE user_id = ?`).get(userId);
        if (!existing) {
        db.prepare(`INSERT INTO users (user_id, dm_opt_in, created_at) VALUES (?, 0, ?)`)
            .run(userId, new Date().toISOString());
        }


        //Add activity log to database
        const result = db.prepare(`
            INSERT INTO activity_logs (user_id, activity_type, hours, timestamp)
            VALUES (?, ?, ?, ?)`)
            .run(userId, activity, hours, new Date().toISOString());

        await interaction.reply(`Logged ${hours} hour(s) of **${activity}** for <@${userId}>. Log ID: **${result.lastInsertRowid}**`); 
    }



}