const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const QuickChart = require('quickchart-js');
const db = require('../../db');

const fs = require('fs');
const path = require('path');
const palettes = JSON.parse(fs.readFileSync(path.join(__dirname, 'palettes.json'), 'utf8'));


module.exports = {

    data: new SlashCommandBuilder()
        .setName('day-summ')
        .setDescription('Visualize your progress on a given day')
        .addStringOption(option =>
            option.setName('chart-type')
            .setDescription('Visualize your hours for a given day on a chart')
            .setRequired(true)
            .addChoices(
                {name: 'Pie Chart', value: 'pie'},
                {name: 'Bar Chart', value: 'bar'},
                {name: 'Doughnut Chart', value: 'doughnut'}

            )
        )
        .addStringOption(option =>
            option.setName('date')
            .setDescription('Day for summarize (format: YYYY-MM-DD')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('palette')
                .setDescription('Color palette to use')
                .setRequired(false)
                .addChoices(
                    { name: 'Forest', value: 'forest' },
                    { name: 'Watermelon', value: 'watermelon' },
                    { name: 'Tropical', value: 'tropical' },
                    { name: 'Pinks', value: 'pinks' },
                    { name: 'Blues', value: 'blues' },
                    { name: 'Greens', value: 'greens' },
                    { name: 'Purples', value: 'purples' },
                    { name: 'Warm', value: 'warm' },
                    { name: 'Cold', value: 'cold' },
                    { name: 'Rainbow', value: 'rainbow' }
                )
        ),
        

     async execute(interaction){
        const userID = interaction.user.id;
        const chartType = interaction.options.getString('chart-type');
        const dateInput = interaction.options.getString('date');
        const paletteChoice = interaction.options.getString('palette') || 'rainbow';

        //to validate date input
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        console.log(dateInput);

        //validating date using regular expression
        if(!dateRegex.test(dateInput)){
            await interaction.reply('Date must be in YYYY-MM-DD format');
            return;
        }

       
        const rows = db.prepare(
            `SELECT activity_type, SUM(hours) AS total_hours
             FROM activity_logs
             WHERE user_id = ?
                AND DATE(substr(timestamp, 1, 10)) = ?
             GROUP BY activity_type;`
        ).all(userID, dateInput);

        //For debugging purposes
        const allTimestamps = db.prepare(
            `SELECT timestamp FROM activity_logs WHERE user_id = ? LIMIT 5`
        ).all(userID);
        console.log('Sample timestamps:', allTimestamps);


        if(rows.length === 0){
            await interaction.reply(`You don't have any logs for ${dateInput}.`);
            return;
        }
        

        const labels = rows.map(r => r.activity_type);
        const data = rows.map(r => r.total_hours);

        //Palettes accommodate 24 hours per day
        const colors = palettes[paletteChoice] || palettes['rainbow'];

        //Making the chart
        const chart = new QuickChart();
        chart.setConfig({
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: `Hours Logged on ${dateInput}`,
                    data: data,
                    backgroundColor: colors.slice(0, data.length)
                }]
            },
        });

        chart.setWidth(600).setHeight(400).setBackgroundColor('transparent');

        const imageBuffer = await chart.toBinary();
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'summary.png' });

        await interaction.reply({
            content: `Here's your ${chartType} summary for **${dateInput}**!`,
            files: [attachment]
        });

     }


}
