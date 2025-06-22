const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('help')
        .setDescription('Commands list'),

    async execute(interaction){
        await interaction.reply("- `track-new` : Enter new activity log for the day (limited to 24 hours)\n - `track-delete` : Delete one of your previously entered log \n - `clear-all-logs` : Deletes the bot's database (admin only and per server)\n - `day-summ` : Choose a chart and color palette for a visual representation of your logs today \n- `week-summ` : Display a chart for your logs (last 7 days) \n - `good-bot` : Congratulate the bot (no reinforcement learning involved, just a placebo effect) \n - `bad-bot` : Oh no... what did bot do😨? (no reinforcement learning involved, but notifies dev about mistakes for future versions)") 
        await interaction.followUp("Would you like to try a slash command now👀?")
    }

}