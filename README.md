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

```sh
nvm use v16.17.0
npm install 
cp .env.example .env
#
# botToken: bot token
# clientId: bot ID
# notionKey: notion api key
# materialTable: card database
# relationTable: author database
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
