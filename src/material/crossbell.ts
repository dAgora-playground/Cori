import {
    Contract,
    NoteMetadata,
    NoteMetadataAttachmentBase,
} from "crossbell.js";
import { Wallet } from "ethers";
import pinyin from "pinyin";

const formatHandle = (author: string, guildId: string) => {
    const formatedGuildName = pinyin(guildId, {
        style: "normal",
    })
        .map((arr) => arr[0])
        .join("");
    const tmpHandle = (author + "-" + formatedGuildName)
        .toLowerCase()
        .slice(0, 31);
    let handle = "";
    for (let i = 0; i < Math.min(31, tmpHandle.length); i++) {
        const c = tmpHandle[i];
        if (
            (c >= "a" && c <= "z") ||
            (c >= "0" && c <= "9") ||
            c == "_" ||
            c == "-"
        ) {
            handle += c;
            continue;
        } else {
            handle += "-";
        }
    }
    return handle;
};

export async function useCrossbell(
    username: string,
    authorId: string,
    authorAvatar: string,
    banner: string,
    guildName: string,
    channelName: string,
    title: string,
    publishedTime: Date,
    tags: string[],
    content: string,
    attachments: NoteMetadataAttachmentBase<"address">[],
    discordUrl: string
) {
    // If the author has not been created a character, create one first
    // Otherwise, post note directly
    const priKey = process.env.adminPrivateKey;
    const admin = await new Wallet(priKey).getAddress();
    const contract = new Contract(priKey);

    await contract.connect();

    const handle = formatHandle(authorId, guildName);
    //TODO: is valid handle
    console.log(authorAvatar, handle);
    if (handle.length < 3) {
        throw new Error("handle length is wrong");
    }

    let characterId = (await contract.getCharacterByHandle(handle)).data
        .characterId;

    if (!characterId) {
        if ((await contract.existsCharacterForHandle(handle)).data) {
            throw new Error("handle has existed");
        }
        const { data, transactionHash } = await contract.createCharacter(
            admin,
            handle,
            {
                name: username,
                avatars: [authorAvatar],
                banners: [
                    {
                        address: banner,
                        mime_type: "media/image", //TODO
                    },
                ],
                connected_accounts: ["csb://account:" + authorId + "@discord"],
            }
        );

        characterId = data;

        await contract.setOperator(characterId, admin);
    }
    const operator = (await contract.getOperator(characterId)).data;
    if (operator !== admin) {
        throw new Error("not authorized");
    }

    const note = {
        sources: [
            "cori",
            "discord server: " + guildName,
            "channel: " + channelName,
        ],
        title,
        content,
        tags,
        attachments,
        date_published: publishedTime.toISOString(),
        external_urls: [discordUrl],
    } as NoteMetadata;
    const noteId = (await contract.postNote(characterId, note)).data.noteId;
    return { characterId, noteId };
}
