require("dotenv").config();
import { Event } from "../structures/Event";
import { Message } from "discord.js";
import i18next from "../material/i18n";
import { handle, setLanguage } from "../utils";

const { t } = i18next;
const mentionBot = (message: Message): Boolean => {
    // message.mentions.users is a collection, and message.mentions.users.first()
    // doesn't mean the first one in mentions
    return !!message.mentions.users.find(
        (u) => u.bot === true && u.id === process.env.clientId
    );
};

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

        await setLanguage(contentMsg.guildId, contentMsg.guild.name);

        // If this is a duplicate suggestion?
        if (
            contentMsg.reactions.cache.find(
                (r) =>
                    r.emoji.name === "📦" &&
                    r.users.cache.has(process.env.clientId)
            )
        ) {
            suggestionMsg.reply(t("repeated"));
            return;
        }
        // Only author could ask the bot to handle his/her message
        if (suggestionMsg.author.id != contentMsg.author.id) {
            const collectNote = suggestionMsg.content
                .split(" ")
                .splice(1)
                .join(" ");
            const confirmMsg = await contentMsg.reply(
                t("confirm", { author: suggestionMsg.author.username }) +
                    `\n ` +
                    collectNote
            );
            confirmMsg.react("👌");
        } else {
            handle(contentMsg, suggestionMsg);
        }
    }
});
