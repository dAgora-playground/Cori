import {
    Contract,
    NoteMetadata,
    NoteMetadataAttachmentBase,
} from "crossbell.js";
import { Wallet } from "ethers";
import pinyin from "pinyin";

const formatHandle = (authorId: string, guildId: string) => {
    const formatedGuildName = pinyin(guildId, {
        style: "normal",
    })
        .map((arr) => arr[0])
        .join("");
    const tmpHandle = (authorId + "-" + formatedGuildName)
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

const createNewCharacter = async (
    c: Contract,
    admin: string,
    handle: string,
    name: string,
    authorAvatar: string,
    authorId: string,
    banner: string
) => {
    const { data, transactionHash } = await c.createCharacter(admin, handle, {
        name,
        avatars: [authorAvatar],
        banners: [
            {
                address: banner,
                mime_type: "media/image", //TODO
            },
        ],
        connected_accounts: ["csb://account:" + authorId + "@discord"],
    });
    return data;
};

export const getPermission = async (
    c: Contract,
    characterId: number,
    admin: string
) => {
    const permissions = (
        await c.getOperatorPermissionsForCharacter(characterId, admin)
    ).data;
    return permissions;
};
const getCharacterByHandle = async (
    c: Contract,
    admin: string,
    handle: string,
    name: string,
    authorAvatar: string,
    authorId: string,
    banner: string,
    checkAdminAuthorized: boolean = true
) => {
    let characterId = (
        await c.contract.getCharacterByHandle(handle)
    ).characterId.toNumber();

    if (!characterId) {
        if ((await c.existsCharacterForHandle(handle)).data) {
            throw new Error("handle has existed");
        }

        characterId = await createNewCharacter(
            c,
            admin,
            handle,
            name,
            authorAvatar,
            authorId,
            banner
        );
    }
    if (checkAdminAuthorized) {
        const characterOwner = await c.contract.ownerOf(characterId);
        if (characterOwner !== admin) {
            const permissions = await getPermission(c, characterId, admin);
            if (!permissions.includes("POST_NOTE")) {
                throw new Error(
                    characterId + "(" + handle + ") not authorized"
                );
            }
        }
    }

    return characterId;
};

export const makeContract = async (priKey?: string) => {
    const contract = new Contract(priKey);
    await contract.connect();
    return contract;
};

export const getAdminContract = async (priKey: string) => {
    const admin = await new Wallet(priKey).getAddress();
    const contract = await makeContract(priKey);
    return { admin, contract };
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
    curatorId: string,
    curatorUsername: string,
    curatorAvatar: string,
    curatorBanner: string,
    discordUrl: string
) {
    // If the author has not been created a character, create one first
    // Otherwise, post note directly
    const priKey = process.env.adminPrivateKey;
    const { admin, contract } = await getAdminContract(priKey);
    const handle = formatHandle(authorId, guildName);

    const curatorHandle = formatHandle(curatorId, guildName);

    //TODO: is valid handle?
    if (handle.length < 3) {
        throw new Error("handle length is wrong");
    }

    const characterId = await getCharacterByHandle(
        contract,
        admin,
        handle,
        username,
        authorAvatar,
        authorId,
        banner
    );

    let curatorCharacterId = characterId;
    if (curatorHandle !== handle) {
        curatorCharacterId = await getCharacterByHandle(
            contract,
            admin,
            curatorHandle,
            curatorUsername,
            curatorAvatar,
            curatorId,
            curatorBanner,
            false
        );
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
        attributes: [
            {
                trait_type: "curator",
                value:
                    "csb://account:character-" +
                    curatorCharacterId +
                    "@crossbell",
            },
        ],
    } as NoteMetadata;
    const noteId = (await contract.postNote(characterId, note)).data.noteId;
    return { characterId, noteId };
}
