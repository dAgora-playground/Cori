import { CommandInteractionOptionResolver, ReactionEmoji } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";
import messageCreate from "./messageCreate";
import interactionCreate from "./interactionCreate";
import {storage} from "./messageCreate";


export default new Event("messageReactionAdd", async (reaction, user) => {
    console.log(user)
    console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
    if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	// // Now the message has been cached and is fully available
	// console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// // The reaction is now also fully available and the properties will be reflected accurately:
	// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    console.log(reaction)
    
    // reaction完成建议内容的投喂:
    // 1.Atlas发了消息，ada@cori建议投喂
    // 2.Cori发出一条消息@atlas
    // 3.Atlas 点这条Cori消息。
    // // 监控到emoji:white_check_mark: 
    if (reaction.emoji.name === '✅'){
        const reactionMessage = await reaction.message.fetch();
        //检查作者是cori btw:cori id <@1018873453610274877> dino 950670085431918612 atlas 815043799322460242  ada 340572879638757386
        if (reaction.message.author.id === '1018873453610274877' ){
            //检查消息包括特定的内容.
            if (reactionMessage.content.includes('觉得你说的很好，想让你投喂给我') ) {
                const repliedMessage = await reaction.message.fetchReference();
                //emoji点的人 = Cori引用消息的作者
                if (repliedMessage.author.id === user.id){
                    //调用投喂功能，完成投喂
                    storage(repliedMessage,reactionMessage)          
                    return 
                }
            }
        }
    }
});
