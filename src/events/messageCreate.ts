require("dotenv").config();
import { Event } from "../structures/Event";
import materialHandler from "../material";
import { Message, User } from "discord.js";
import { handlerConfig } from "../config";
import { logger } from "ethers";

const mentionBot = (message: Message): Boolean => {
    // message.mentions.users is a collection, and message.mentions.users.first()
    // doesn't mean the first one in mentions
    return !!message.mentions.users.find(
        (u) => u.bot === true && u.id === process.env.clientId
    );
};

const getUserId = (user: User) => `${user.username}#${user.discriminator}`;

const getMsgUserInfo = (msg: Message) => {
    const contentAuthor = msg.author;
    return {
        username: contentAuthor.username,
        id: getUserId(contentAuthor),
        avatar: contentAuthor.avatarURL(),
        banner: contentAuthor.bannerURL(),
    };
};

//把存储notion和上链功能包起来，方便调用.
export async function handle(
    contentMsg: Message<boolean>,
    confirmOrSuggestionMsg: Message<boolean>
) {
    const stateMessage = await confirmOrSuggestionMsg.reply("收藏中...");
    const {
        username: authorUsername,
        id: authorDiscordId,
        avatar: authorAvatar,
        banner: authorBanner,
    } = getMsgUserInfo(contentMsg);

    const guildName = confirmOrSuggestionMsg.guild.name;
    const channelName = (
        await confirmOrSuggestionMsg.guild.channels.fetch(
            confirmOrSuggestionMsg.channelId
        )
    ).name;
    let content = contentMsg.content;
    contentMsg.mentions.users.map((user) => {
        content = content.replace("<@" + user.id + ">", "@" + user.username);
    });

    const attachments = contentMsg.attachments.map((attachment) => ({
        address: attachment.url,
        mime_type: attachment.contentType,
        size_in_bytes: attachment.size,
        width: attachment.width,
        height: attachment.height,
    }));

    const collectNote = confirmOrSuggestionMsg.content
        .split(" ")
        .splice(1)
        .join(" ");
    const title =
        collectNote.search(/,|，/) > 0 || collectNote.search(/\/|、/) < 0
            ? collectNote.split(/,|，/)[0]
            : "";
    const publishedAt = new Date(contentMsg.createdTimestamp);
    const tags =
        collectNote.search(/,|，/) > 0 || collectNote.search(/\/|、/) > 0
            ? collectNote.split(/,|，/).pop().split(/\/|、/)
            : [];
    const discordUrl = contentMsg.url;

    // 检查作者是cori来判断Curator是否和Author一致
    let curatorDiscordId: string;
    let curatorUsername: string;
    let curatorAvatar: string;
    let curatorBanner: string;
    if (confirmOrSuggestionMsg.author.id === process.env.clientId) {
        //content第一个mention的username+编号
        let curatorId = confirmOrSuggestionMsg.content.split(/>/)[0];
        curatorId = curatorId.split(/@/)[1];
        confirmOrSuggestionMsg.mentions.users.map((user) => {
            if (user.id == curatorId) {
                curatorUsername = user.username;
                curatorDiscordId = getUserId(user);
                curatorAvatar = user.avatarURL();
                curatorBanner = user.bannerURL();
            }
        });
    } else {
        curatorDiscordId = authorDiscordId;
    }

    let response = "";
    if (handlerConfig.useNotion) {
        let subResponse = "素材添加 Notion 中..." + "\n";
        stateMessage.edit(response + subResponse);
        try {
            await materialHandler.useNotion(
                authorDiscordId,
                guildName,
                channelName,
                title,
                publishedAt,
                tags,
                content,
                curatorDiscordId,
                discordUrl
            );

            subResponse = `✅ 素材碎片Notion添加成功! ` + "\n"; //见: https://ddaocommunity.notion.site/b07350607bc446dbb39153db32fde357
        } catch (e) {
            logger.warn(e);
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
            const { characterId, noteId } = await materialHandler.useCrossbell(
                authorUsername,
                authorDiscordId,
                authorAvatar,
                authorBanner,
                guildName,
                channelName,
                title,
                publishedAt,
                tags,
                content,
                attachments,
                curatorDiscordId,
                curatorUsername,
                curatorAvatar,
                curatorBanner,
                discordUrl
            );
            subResponse = `✅ 素材碎片上链成功! 见:  https://crossbell.io/notes/${characterId}-${noteId}`;
            contentMsg.react("📦");
        } catch (e) {
            logger.warn(e);
            subResponse =
                ":negative_squared_cross_mark: 上链失败, 请联络 BOT 管理员协助处理";
        } finally {
            response += subResponse;
            stateMessage.edit(response);
        }
    }
    contentMsg.react("📦");
}

export default new Event("messageCreate", async (suggestionMsg) => {
    // If the this message @ someone and this is a reply message
    if (!!suggestionMsg.mentions.users.first() && !!suggestionMsg.reference) {
        const contentMsg = await suggestionMsg.fetchReference();
        // If this message is sent from the bot, or this is to reply bot,
        // or this message doesn't @ this bot, ignore.
        if (
            suggestionMsg.author.bot ||
            contentMsg.author.bot ||
            !mentionBot(suggestionMsg)
        ) {
            return;
        }
        // If this is a duplicate suggestion?
        if (
            contentMsg.reactions.cache.find(
                (r) =>
                    r.emoji.name === "📦" &&
                    r.users.cache.has(process.env.clientId)
            )
        ) {
            suggestionMsg.reply("重复投喂");
            return;
        }
        // Only author could ask the bot to handle his/her message
        if (suggestionMsg.author.id != contentMsg.author.id) {
            const collectNote = suggestionMsg.content
                .split(" ")
                .splice(1)
                .join(" ");
            const confirmMsg = await contentMsg.reply(
                `${suggestionMsg.author}觉得你说的很好，想让你投喂给我。点👌确认\n ` +
                    collectNote
            );
            confirmMsg.react("👌");
        } else {
            handle(contentMsg, suggestionMsg);
        }
    }
});
