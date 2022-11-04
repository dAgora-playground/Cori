declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            guildId: string;
            clientId: string;
            notionKey: string;
            materialTable: string;
            relationTable: string;
            adminPrivateKey: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

export {};
