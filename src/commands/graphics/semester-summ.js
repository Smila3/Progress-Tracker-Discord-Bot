const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const fs = require('fs');
const path = require('path');
const db = require('../../db');

// Load palettes from palettes.json
const palettes = JSON.parse(fs.readFileSync(path.join(__dirname, 'palettes.json'), 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('semester-summ')
        .setDescription('Visualize your progress this semester')
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

        const today = new Date();
        const last4Months = [];

        //populate array of last 4 months
        for(let i = 3; i >= 0; i--){
            const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            last4Months.push(`${year}-${month}`);
        }

        //summing hours for activity_type by month
        const rows = db.prepare(`
            SELECT activity_type, strftime('%Y-%m', timestamp) AS month, SUM(hours) AS total_hours
            FROM activity_logs
            WHERE user_id = ? AND strftime('%Y-%m', timestamp) IN (${last4Months.map(() => '?').join(',')})
            GROUP BY activity_type, month
        `).all(userID, ...last4Months);

        // Build mapping: activity_type → { month → hours }
        const activityMap = {};
        for (const row of rows) {
            if (!activityMap[row.activity_type]) {
                activityMap[row.activity_type] = Object.fromEntries(last4Months.map(m => [m, 0]));
            }
            activityMap[row.activity_type][row.month] = row.total_hours;
        }

        // Build datasets for grouped bar chart
        const datasets = Object.entries(activityMap).map(([activity, monthMap], index) => ({
            label: activity,
            data: last4Months.map(month => monthMap[month]),
            backgroundColor: palette[index % palette.length]
        }));

        const chart = new QuickChart();
        chart.setConfig({
            type: 'bar',
            data: {
                labels: last4Months,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'black', font: { weight: 'bold' } } },
                    title: {
                        display: true,
                        text: 'Hours Logged per Activity by Month',
                        color: 'white',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white', font: { weight: 'bold' } },
                        stacked: false
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'white', font: { weight: 'bold' } }
                    }
                }
            }
        });

        chart.setWidth(800).setHeight(500).setBackgroundColor('transparent');
        const imageBuffer = await chart.toBinary();
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'semester-summary.png' });

        await interaction.reply({
            content: `Here is your grouped bar chart summary for the last 4 months!`,
            files: [attachment]
        });
        
    }
}