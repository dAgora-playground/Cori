# Cori

[Cori](https://ddaocommunity.notion.site/Cori-4b631a6498c24f449ab5fbb865dbefca) 是一个 discord bot，属于协同写作产品 Agora 的一部分。

Agora 孵化于 dDAO 社区，是一个由社区去中心化开发运营，实践PCF（Product Community Fit）理念的一款产品。


## 功能说明

在 Discord 中回复想要存入素材库的信息，并依照此格式输入：
```
\n\n@Cori [标题], [标签1]/[标签2]/.../[标签3]\n\n //括号不用填，标题与标签的分隔逗点可为半形或全形
```
之后素材会收藏到 Notion 或 Crossbell 链上。
## Getting Started

在 Discord Developer Portal 设置 Discord bot 需要的权限
MESSAGE CONTENT INTENT
Read Messages/View Channels
Send Messages
Send Messages in Threads
Add Reactions

### 准备测试用的两个 Notion database
从 [模版页面](https://ddaocommunity.notion.site/b07350607bc446dbb39153db32fde357)点击右上角 Duplicate, 将模版页面复制到你的 Notion workspace。

这个页面包含素材碎片（materialTable）、协同写作者（relationTable）和 Cori 配置（configTable）三个表，请在在新页面中打开每个表（Open as full page），然后从浏览器地址栏获取表的 32 字符长的 ID，例如 `https://www.notion.so/e765e495143b1e3128784198df25301c` 中，`e765e495143b1e3128784198df25301c` 就是这个表的 ID。

根据[文档](https://developers.notion.com/docs/create-a-notion-integration#step-2-share-a-database-with-your-integration)建立一个 Notion integration，并将这个 integration 连接到你的 database。

### 开始
```sh
nvm use
npm install 
cp .env.example .env
#
# botToken: bot token
# clientId: bot ID
# notionKey: notion api key started with 'secret_'
# materialTable: card database 素材碎片表ID
# relationTable: author database 协同写作者表ID
# configTable: config database Cori 配置表ID
# adminPrivateKey: admin privatekey
# environment: dev | prod | debug
#
npm start:dev # 运行 bot
npm migrate # 迁移旧数据上链

```
## Build a nodejs image and share to the Docker Hub

```sh
sudo docker image build -t 'cori' .
sudo docker tag cori <your name>/cori
sudo docker push <your name>/cori
```

## 加入我们
https://discord.com/channels/995771542631890944/1019574929571721266

## 捐赠dDAO
https://gitcoin.co/grants/7272/ddao-community-small-sociological-experiment
