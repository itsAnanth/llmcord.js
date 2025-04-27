import { Base, ClientOptions, Client as dClient } from 'discord.js'
import { Event } from '@/Discord/Event';
import { BaseLLM, GroqAILLM } from '@/LLM';

interface Options extends ClientOptions {
    llmclient: BaseLLM | GroqAILLM
}

class Client extends dClient {
    
    llmclient: BaseLLM | GroqAILLM

    constructor(options: Options) {
        super(options);

        this.llmclient = options.llmclient
    }


    public async registerEvents(dir: string) {
        await Event.handleEvents(this, dir)
    }
}

export default Client;