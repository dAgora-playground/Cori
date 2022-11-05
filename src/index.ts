require("dotenv").config();
import { ExtendedClient } from "./structures/Client";
import { Network } from "crossbell.js";

if (process.env.CROSSBELL_RPC_ADDRESS === "http://127.0.0.1:8545") {
    const info = Network.getCrossbellMainnetInfo();
    info.chainId = 31337;
    Network.getCrossbellMainnetInfo = () => info;
}

export const client = new ExtendedClient();

client.start();
