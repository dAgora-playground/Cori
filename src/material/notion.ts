import { RichTextPropertyItemObjectResponse, SelectPropertyItemObjectResponse, TitlePropertyItemObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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
    curator: string,
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

    //增加建议投喂人为curator
    const curatorPageList = await notion.databases.query({
        database_id: relationTable,
        filter: {
            property: "Discord ID",
            rich_text: {
                equals: curator,
            },
        },
    });
    var curatorPage;
    if (curatorPageList.results.length == 0) {
        curatorPage = await notion.pages.create({
            parent: {
                database_id: relationTable,
            },
            properties: {
                "Discord ID": {
                    title: [
                        {
                            text: {
                                content: curator,
                            },
                        },
                    ],
                },
            },
        });
    } else {
        curatorPage = curatorPageList.results[0];
    }

    const ret = await notion.pages.create({
        parent: {
            database_id: materialTable,
        },
        properties: {
            Author: {
                relation: [
                    {
                        id: authorPage.id,
                    },
                ],
            },
            Curator: {
                relation: [
                    {
                        id: curatorPage.id,
                    },
                ],
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

type CoriConfig = {
    Language: SelectPropertyItemObjectResponse,
    'Discord Server ID': TitlePropertyItemObjectResponse,
    'Discord Server Name': RichTextPropertyItemObjectResponse,
}

export async function getCoriConfig(discordServerID: string): Promise<CoriConfig | null> {
    const databaseId = process.env.configTable;
    const response = await notion.databases.query({
        database_id: databaseId,
        select: {
            property: "Discord Server ID",
            title: { equals: discordServerID },
        }
    });
    const data = response.results;

    if (data.length) {
        return data[0].properties;
    }

    return null;
}

type Language = '简体中文' | '繁體中文' | 'EN';
export async function createCoriConfig(discordServerID: string, discordServerName: string, language: Language): Promise<CoriConfig> {
    const databaseId = process.env.configTable;
    const response = await notion.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: {
            "Discord Server ID": {
                type: 'title',
                title: [
                    {
                        type: 'text',
                        text: {
                            content: discordServerID,
                        },
                    },
                ],
            },
            "Discord Server Name": {
                type: 'rich_text',
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: discordServerName,
                        },
                    },
                ],
            },
            Language: {
                type: "select",
                select: {
                    name: language,
                },
            }
        },
    });

    return response.properties;
}