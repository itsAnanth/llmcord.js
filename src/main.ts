import { GroqAILLM } from "@/LLM";
import log from 'loglevel'
import { Client } from '@/Discord/Client';
import { GatewayIntentBits, LimitedCollection } from "discord.js";

/**
 * Log levels
 * 
 * log.trace(msg)
 * log.debug(msg)
 * log.info(msg)
 * log.warn(msg)
 * log.error(msg)
 */

log.setLevel('INFO');

(async function() {
    const llm = new GroqAILLM({
        max_completion_tokens: 400
    });
    const client = new Client({ 
            intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ],
        allowedMentions: {
            parse: [],
            repliedUser: false
        },
        llmclient: llm

    });

    await client.registerEvents('./src/events')

    client.login(process.env.DISCORD_BOT_TOKEN)
})()

// (async function() {
//     let msg = await llm.generate("What are LLMs?")
//     console.log(llm.messages)
    
//     msg = await llm.generate("Who is einstein?")
//     console.log(llm.messages)
    

//     msg = await llm.generate("What is an encyclopedia?")
//     console.log(llm.messages)
    

// })()