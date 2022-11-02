import { Event } from "../structures/Event";
import { client } from "..";

export default new Event("ready", () => {
    console.log(`Ready! Logged in as ${client.user.tag}.`);
});