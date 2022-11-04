require("dotenv").config();
import { Event } from "../structures/Event";
import materialHandler from "../material";
import { Message } from "discord.js";
import { handlerConfig } from "../config";

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
            const username = repliedMessage.author.username;
            const authorId = `${username}#${repliedMessage.author.discriminator}`;
            const authorAvatar = repliedMessage.author.avatarURL();
            const banner = repliedMessage.author.bannerURL();
            const guildName = message.guild.name;
            const channelName = (
                await message.guild.channels.fetch(message.channelId)
            ).name;
            let content = repliedMessage.content;
            repliedMessage.mentions.users.map((user) => {
                content = content.replace(
                    "<@" + user.id + ">",
                    "@" + user.username
                );
            });

            const attachments = repliedMessage.attachments.map(
                (attachment) => ({
                    address: attachment.url,
                    mime_type: attachment.contentType,
                    size_in_bytes: attachment.size,
                    width: attachment.width,
                    height: attachment.height,
                })
            );

            const collectNote = message.content.split(" ").splice(1).join("");
            const title =
                collectNote.search(/,|，/) > 0 ||
                collectNote.search(/\/|、/) < 0
                    ? collectNote.split(/,|，/)[0]
                    : "";
            const publishedAt = new Date(repliedMessage.createdTimestamp);
            const tags =
                collectNote.search(/,|，/) > 0 ||
                collectNote.search(/\/|、/) > 0
                    ? collectNote.split(/,|，/).pop().split(/\/|、/)
                    : [];
            const discordUrl = repliedMessage.url;

            let response = "";
            if (handlerConfig.useNotion) {
                let subResponse = "素材添加 Notion 中..." + "\n";
                stateMessage.edit(response + subResponse);
                try {
                    await materialHandler.useNotion(
                        authorId,
                        guildName,
                        channelName,
                        title,
                        publishedAt,
                        tags,
                        content,
                        discordUrl
                    );
                    subResponse =
                        `✅ 素材碎片添加成功! 见: https://ddaocommunity.notion.site/b07350607bc446dbb39153db32fde357` +
                        "\n";
                } catch (e) {
                    subResponse =
                        ":negative_squared_cross_mark: 添加 Notion 失败, 请联络 BOT 管理员协助处理" +
                        "\n";
                } finally {
                    response += subResponse;
                    stateMessage.edit(response);
                }
            }

            if (handlerConfig.useCrossbell) {
                let subResponse = "素材上链中..." + "\n";
                stateMessage.edit(response + subResponse);
                try {
                    const { characterId, noteId } =
                        await materialHandler.useCrossbell(
                            username,
                            authorId,
                            authorAvatar,
                            banner,
                            guildName,
                            channelName,
                            title,
                            publishedAt,
                            tags,
                            content,
                            attachments,
                            discordUrl
                        );
                    subResponse = `✅ 素材碎片上链成功! 见:  https://crossbell.io/notes/${characterId}-${noteId}`;
                } catch (e) {
                    subResponse =
                        ":negative_squared_cross_mark: 上链失败, 请联络 BOT 管理员协助处理";
                } finally {
                    response += subResponse;
                    stateMessage.edit(response);
                }
            }
        }
    }
});
