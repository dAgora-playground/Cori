import { Command } from "../structures/Command";
const wait = require('node:timers/promises').setTimeout;

export default new Command({
    name: "help",
    description: "查看bot的食用指南",
    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ 
            content: ':information_source: 请回复你想要存入素材库的信息，并依照此格式输入：\n\n@Cori [标题], [标签1]/[标签2]/.../[标签3]\n\n括号不用填，标题与标签的分隔逗点可为半形或全形。', 
            // ephemeral: true,
        });
    }
});