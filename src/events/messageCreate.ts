import { Event } from "@/Discord/Event";
import { Message } from "discord.js";
import log from 'loglevel';

export default new Event({
    name: Event.Events.MessageCreate,
    async execute(bot, message: Message) {

        // @ts-ignore
        if (message.mentions.has(bot.user)) {
            const reply = await bot.llmclient.generate(message.content)

            const chunks = reply.match(/[\s\S]{1,1900}/g) || [];
            for (const chunk of chunks) {
                if (message.channel.isSendable())
                    await message.channel.send(chunk)
            }

            message.reply(reply)
        }
    },
})