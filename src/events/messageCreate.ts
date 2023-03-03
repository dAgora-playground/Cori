require("dotenv").config();
import { Event } from "../structures/Event";
import materialHandler from "../material";
import { Message, User } from "discord.js";
import { handlerConfig } from "../config";
import { logger } from "ethers";
import i18next from '../material/i18n';
import { createCoriConfig, getCoriConfig } from '../material/notion';

const { t } = i18next;
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
    let config = await getCoriConfig(contentMsg.guildId);
    if (!config) {
        config = await createCoriConfig(contentMsg.guildId, contentMsg.guild.name, 'EN');
    }
    const language = config['Language'].select.name;
    i18next.changeLanguage(language);

    const stateMessage = await confirmOrSuggestionMsg.reply(t('collecting'));
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
        let subResponse = t('push to notion') + "\n";
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

            subResponse = t('notion success') + "\n"; //见: https://ddaocommunity.notion.site/b07350607bc446dbb39153db32fde357
        } catch (e) {
            logger.warn(e);
            subResponse = t('notion error') + "\n";
        } finally {
            response += subResponse;
            stateMessage.edit(response);
        }
    }
    if (handlerConfig.useCrossbell) {
        let subResponse = t('push to chain');//"素材上链中..." + "\n";
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
            subResponse = t('chain success', { characterId, noteId });
            contentMsg.react("📦");
        } catch (e) {
            logger.warn(e);
            subResponse = t('chain error');
        } finally {
            response += subResponse;
            stateMessage.edit(response);
        }
    }
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

        // get language from cori config
        let config = await getCoriConfig(contentMsg.guildId);
        if (!config) {
            config = await createCoriConfig(contentMsg.guildId, contentMsg.guild.name, 'EN');
        }
        const language = config['Language'].select.name;

        // If this is a duplicate suggestion?
        if (
            contentMsg.reactions.cache.find(
                (r) =>
                    r.emoji.name === "📦" &&
                    r.users.cache.has(process.env.clientId)
            )
        ) {
            suggestionMsg.reply(t('repeated'));
            return;
        }
        // Only author could ask the bot to handle his/her message
        if (suggestionMsg.author.id != contentMsg.author.id) {
            const collectNote = suggestionMsg.content
                .split(" ")
                .splice(1)
                .join(" ");
            const confirmMsg = await contentMsg.reply(
                t('confirm', { author: suggestionMsg.author.username }) +
                `\n ` + collectNote
            );
            confirmMsg.react("👌");
        } else {
            handle(contentMsg, suggestionMsg);
        }
    }
});
