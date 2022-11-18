import { Network } from "crossbell.js";
import materialHandler from "../material";
const csv = require("node-csv").createParser();

require("dotenv").config();
if (process.env.CROSSBELL_RPC_ADDRESS === "http://127.0.0.1:8545") {
    const info = Network.getCrossbellMainnetInfo();
    info.chainId = 31337;
    Network.getCrossbellMainnetInfo = () => info;
}

csv.mapFile("./data/notion.csv", async function (err, data) {
    const titleName = Object.keys(data[0])[0];
    for (const entry of data) {
        const username = entry["Discord ID"].split("#")[0] as string;
        const authorId = entry["Discord ID"] as string;
        const authorAvatar = "";
        const banner = "";
        const guildName = entry["Guild ID"] as string;
        const channelName = entry["Channel ID"] as string;
        const title = entry[titleName] as string;
        const publishedTime = new Date(entry["发布时间"]);
        const tags = entry["Key Words"].split(",") as string[];
        const content = entry["素材碎片"] as string;
        const attachments = [];
        const curator = entry["Curator"] as string;
        const discordUrl = entry["Discord URL"] as string;
        try {
            const { characterId, noteId } = await materialHandler.useCrossbell(
                username,
                authorId,
                authorAvatar,
                banner,
                guildName,
                channelName,
                title,
                publishedTime,
                tags,
                content,
                attachments,
                curator,
                discordUrl
            );
            console.log(characterId, noteId);
        } catch (e) {
            console.log(entry);
            console.log(e.message);
        }
    }
});
