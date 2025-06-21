const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const fs = require('fs');
const path = require('path');
const db = require('../../db');

// Load palettes from palettes.json
const palettes = JSON.parse(fs.readFileSync(path.join(__dirname, 'palettes.json'), 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('week-summ')
        .setDescription('Visualize your progress over the past 7 days')
        .addStringOption(option =>
            option.setName('chart-type')
                .setDescription('Choose your chart type')
                .setRequired(true)
                .addChoices(
                    { name: 'Bar Chart', value: 'bar' },
                    { name: 'Line Chart', value: 'line' }
                )
        )
        .addStringOption(option =>
            option.setName('palette')
                .setDescription('Choose a color palette')
                .setRequired(true)
                .addChoices(
                    ...Object.keys(palettes).map(p => ({ name: p, value: p })) //smarter way to display palettes in chat
                )
        ),

    async execute(interaction) {
        const userID = interaction.user.id;
        const chartType = interaction.options.getString('chart-type');
        const paletteName = interaction.options.getString('palette');
        const palette = palettes[paletteName];

        if (!palette) {
            await interaction.reply(`Palette **${paletteName}** not found.`);
            return;
        }

        // Generate last 7 dates in YYYY-MM-DD format
        const today = new Date();

        const last7Dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().slice(0, 10);
        }).reverse();

        const rows = db.prepare(
            `SELECT activity_type, DATE(timestamp) AS date, SUM(hours) AS total_hours
             FROM activity_logs
             WHERE user_id = ? AND DATE(timestamp) >= DATE(?)
             GROUP BY activity_type, DATE(timestamp)`
        ).all(userID, last7Dates[0]);

        if (rows.length === 0) {
            await interaction.reply(`You don't have any logs in the last 7 days.`);
            return;
        }

        // Map of activity_type to { [date]: hours }
        const activityMap = {};
        for (const row of rows) {
            if (!activityMap[row.activity_type]) {
                activityMap[row.activity_type] = Object.fromEntries(last7Dates.map(date => [date, 0]));
            }
            activityMap[row.activity_type][row.date] = row.total_hours;
        }

        // Assign colors to activities
        const activityNames = Object.keys(activityMap);
        const assignedColors = {};
        activityNames.forEach((activity, i) => {
            assignedColors[activity] = palette[i % palette.length]; // Wrap if more activities than colors
        });

        // Build datasets for chart
        const datasets = activityNames.map(activity => ({
            label: activity,
            data: last7Dates.map(date => activityMap[activity][date]),
            fill: false,
            backgroundColor: assignedColors[activity],
            borderColor: assignedColors[activity],
            tension: 0.3
        }));

        // Build chart
        const chart = new QuickChart();
        chart.setConfig({
            type: chartType,
            data: {
                labels: last7Dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Your Logged Hours Over the Past 7 Days`,
                        font: { size: 18 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        chart.setWidth(700).setHeight(400).setBackgroundColor('transparent');

        const imageBuffer = await chart.toBinary();
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'weekly-summary.png' });

        await interaction.reply({
            content: `Here's your ${chartType} summary using the **${paletteName}** palette:`,
            files: [attachment]
        });
    }
};
