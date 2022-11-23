import { Event } from "../structures/Event";
import { handle } from "./messageCreate";

export default new Event("messageReactionAdd", async (reaction, reactUser) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(
                "Something went wrong when fetching the message:",
                error
            );
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // reaction完成建议内容的投喂:
    // 1.Atlas发了消息，ada@cori建议投喂
    // 2.Cori发出一条消息@atlas
    // 3.Atlas 点这条Cori消息。
    // 监控到emoji👌
    if (reaction.emoji.name === "👌") {
        const confirmMsg = await reaction.message.fetch();
        //如果作者是cori
        if (reaction.message.author.id === process.env.clientId) {
            //如果消息包括特定的内容
            if (confirmMsg.content.includes("觉得你说的很好，想让你投喂给我")) {
                const contentMsg = await reaction.message.fetchReference();
                // Cori引用消息的作者 = emoji点的人
                if (contentMsg.author.id === reactUser.id) {
                    //调用投喂功能，完成投喂
                    await handle(contentMsg, confirmMsg);
                    contentMsg.react("📦");
                    return;
                }
            }
        }
    }
});
