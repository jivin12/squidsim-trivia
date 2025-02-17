import { EmbedBuilder } from "discord.js";
import { MessageCommand } from "../../types";
import chalk from "chalk";
import { updateLbData } from "../../handlers/functions";

export const Command: MessageCommand = {
    name: "addwin",
    category: "Owner",
    usage: "addwin <user> <amount>",
    cooldown: 0,
    description: "Add wins to a user.",
    run: async (client, message, args, prefix): Promise<any> => {
        if (!args[0] || !args[1])
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Missing required parameters.")
                ],
            });
        try {
            const user = message.mentions.users.first().id || args[0];
            const amount = parseInt(args[1]);
            if (isNaN(amount))
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Invalid amount.")
                            .setDescription("Amount must be a number.")
                    ],
                });

            await client.database.userData.upsert({
                where: {
                    userID: user,
                },
                update: {
                    wins: {
                        increment: amount,
                    },
                },
                create: {
                    userID: user,
                    wins: amount,
                    stats: {
                        create: {
                            id: user,
                            lost: 0,
                            commands: 0
                        }
                    }
                },
            })
            await updateLbData(client);

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("Successfully added wins.")
                        .setDescription(`Added ${amount} wins to <@${user}>.`)
                ],
            });
        } catch (e) {
            client.sentry?.captureException(e);
            console.log(chalk.dim.bgRed((e as Error).stack));
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("An error occurred")
                        .setDescription(`Error: ${(e as Error).stack}`),
                ],
            });
        }
    },
};
