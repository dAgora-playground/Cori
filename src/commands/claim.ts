import { Command } from "../structures/Command";

export default new Command({
    name: "claim",
    description: "认领自己的 Character",
    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({
            content: "👷‍♀️努力施工中......",
        });
    },
});
