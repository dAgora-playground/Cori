require("dotenv").config();
import { Event } from "../structures/Event";
import materialHandler from "../material";
import { Message } from "discord.js";

const mentionBot = (message: Message) => {
    return message.mentions.users.first().id == process.env.clientId;
};

export default new Event("messageCreate", async (message) => {
    // If the this message @ someone and this is a reply message
    if (message.mentions.users.first() && message.reference) {
        const repliedMessage = await message.fetchReference();
        // If this message is sent from the bot, or this is to reply bot, or this message doesn't @ this bot, ignore.
        if (
            message.author.bot ||
            repliedMessage.author.bot ||
            !mentionBot(message)
        ) {
            return;
        }
        // Only author could ask the bot to handle his/her message
        if (message.author != repliedMessage.author) {
            repliedMessage.reply(
                `${message.author}觉得你说的很好，想让你投喂给我`
            );
        } else {
            const stateMessage = await message.reply("收藏中...");
            const author = `${repliedMessage.author.username}#${repliedMessage.author.discriminator}`;
            const guildName = message.guild.name;
            const channelName = (
                await message.guild.channels.fetch(message.channelId)
            ).name;
            const content = repliedMessage.content;
            const collectNote = message.content.split(" ").splice(1).join("");
            const title =
                collectNote.search(/,|，/) > 0 ||
                collectNote.search(/\/|、/) < 0
                    ? collectNote.split(/,|，/)[0]
                    : "";
            const publishedAt = new Date(repliedMessage.createdTimestamp);
            const keywords =
                collectNote.search(/,|，/) > 0 ||
                collectNote.search(/\/|、/) > 0
                    ? collectNote.split(/,|，/).pop().split(/\/|、/)
                    : [];
            const discordUrl = repliedMessage.url;
            console.log(guildName);
            materialHandler
                .useNotion(
                    author,
                    guildName,
                    channelName,
                    title,
                    publishedAt,
                    keywords,
                    content,
                    discordUrl
                )
                .then(async () => {
                    stateMessage.edit(
                        `✅ 素材碎片添加成功! 见: https://ddaocommunity.notion.site/b07350607bc446dbb39153db32fde357`
                    );
                    // await message.reply(`【新增卡片】\n作者：${author}\n上传者：${adder}\n服务器：${guildName}\n频道：${channelName}\n题目：${title}\n时间：${date}\n标签：${keywords}\n内容：${material}\n链接：${discordUrl}`);
                })
                .catch(async () => {
                    stateMessage.edit(
                        ":negative_squared_cross_mark: 添加失败, 请联络 BOT 管理员协助处理"
                    );
                });
        }
    }
});
