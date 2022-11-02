// import { Client } from "@notionhq/client";
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.notionKey });
const materialTable = process.env.materialTable;
const relationTable = process.env.relationTable;

export async function useNotion(
    author: string,
    guildId: string,
    channelId: string,
    title: string,
    publishedTime: Date,
    keywords: string[],
    material: string,
    discordUrl: string
) {
    const databaseId = materialTable;
    const kwSelection = [];
    keywords.forEach((kw) => {
        kwSelection.push({
            name: kw,
        });
    });

    const authorPageList = await notion.databases.query({
        database_id: relationTable,
        filter: {
            property: "Discord ID",
            rich_text: {
                equals: author,
            },
        },
    });

    var authorPage;
    if (authorPageList.results.length == 0) {
        authorPage = await notion.pages.create({
            parent: {
                database_id: relationTable,
            },
            properties: {
                "Discord ID": {
                    title: [
                        {
                            text: {
                                content: author,
                            },
                        },
                    ],
                },
            },
        });
    } else {
        authorPage = authorPageList.results[0];
    }

    const ret = await notion.pages.create({
        parent: {
            database_id: materialTable,
        },
        properties: {
            "Discord ID": {
                type: "select",
                select: {
                    name: author,
                },
            },
            Author: {
                relation: [
                    {
                        id: authorPage.id,
                    },
                ],
            },
            "添加人 ID": {
                type: "select",
                select: {
                    name: author, // Author and adder has to be the same one now
                },
            },
            "Guild ID": {
                type: "select",
                select: {
                    name: guildId,
                },
            },
            "Channel ID": {
                type: "select",
                select: {
                    name: channelId,
                },
            },
            标题: {
                title: [
                    {
                        text: {
                            content: title,
                        },
                    },
                ],
            },
            发布时间: {
                type: "date",
                date: {
                    start: `${publishedTime.getUTCFullYear()}-${String(
                        publishedTime.getUTCMonth() + 1
                    ).padStart(2, "0")}-${String(
                        publishedTime.getUTCDate()
                    ).padStart(2, "0")}`,
                },
            },
            素材碎片: {
                rich_text: [
                    {
                        text: {
                            content: material,
                        },
                    },
                ],
            },
            "Discord URL": {
                rich_text: [
                    {
                        text: {
                            link: {
                                type: "url",
                                url: discordUrl,
                            },
                            content: discordUrl,
                        },
                    },
                ],
            },
            "Key Words": {
                type: "multi_select",
                multi_select: kwSelection,
            },
        },
    });

    const response = await notion.databases.query({
        database_id: databaseId,
    });
    const data = response.results[0].properties;
    return JSON.stringify(data);
}
