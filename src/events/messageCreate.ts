import { Event } from "@/Discord/Event";
import { Message } from "discord.js";
import log from 'loglevel';

export default new Event({
    name: Event.Events.MessageCreate,
    async execute(bot, message: Message) {

        if (message.author.bot) return;


        if (message.reference) {
            if (message.reference.type != 0)
                return console.log("invalid msg type")
            const repliedTo = await message.channel.messages.fetch(message.reference.messageId as string);

            if (repliedTo.author.id != bot.user?.id) return
            const context = `${repliedTo.author.username} said: ${repliedTo.content}\n$${message.author.username} said: ${message.content}`
            const reply = await bot.llmclient.generate(context)

            message.reply(reply)
            return

            // const chunks = reply.match(/[\s\S]{1,1900}/g) || [];
            // for (const chunk of chunks) {
            //     if (message.channel.isSendable())
            //         await message.channel.send(chunk)
            // }

        }

        if (!message.content.toLowerCase().includes("jarvis")) return console.log("no mention of jarvis")


        let content = message.content;
        const context = `${message.author.username} said: ${content}`

        const reply = await bot.llmclient.generate(context)

        message.reply(reply)

    },
})