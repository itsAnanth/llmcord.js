import BaseLLM from "@/LLM/BaseLLM";
import Groq from "groq-sdk";
import { config } from 'dotenv'
import log from 'loglevel'

config()

type GroqLLMConfig = {
    model: string;
    stream: boolean;
    max_completion_tokens: number;
    max_context_tokens: number
}

const GROQAI_DEFAULTS: GroqLLMConfig = {
    model: "llama-3.3-70b-versatile",
    stream: false,
    max_completion_tokens: 4096,
    max_context_tokens: 1000
}

class GroqAILLM implements BaseLLM {

    config: GroqLLMConfig;
    groq: Groq;
    total_context_tokens: number;
    messages: any[];

    constructor(config: GroqLLMConfig = GROQAI_DEFAULTS) {

        this.groq = new Groq({ apiKey: process.env.GROP_API_KEY })
        this.config = config
        this.total_context_tokens = 0
        this.messages = []
    }



    public async generate(messages: any[] = []): Promise<any> {
        log.warn(this.total_context_tokens)
        const chatCompletion = await this.groq.chat.completions.create({
            messages: messages,
            model: this.config.model,
            max_completion_tokens: this.config.max_completion_tokens
        })

        const message = chatCompletion.choices[0]?.message?.content || null

        if (!message)
            return message

        let completionTokens = (chatCompletion.usage?.completion_tokens || 0)
        const totalTokens = this.total_context_tokens + completionTokens

        if (totalTokens > this.config.max_context_tokens) {
            log.warn(`context token exceeded limit ${totalTokens} >= ${this.config.max_context_tokens}`)
            const diff = totalTokens - this.config.max_context_tokens
            const reducer = this.messages.reduce((acc, message, i) => {
                acc.sum += message.usage?.completion_tokens || 0;
                if (acc.sum > diff && acc.index === -1) {
                    acc.index = i;
                }
                return acc;
            }, { sum: 0, index: -1 });

            const idx = reducer.index
            
            log.warn(`Truncating context in range ${idx + 1} -- ${this.messages.length}`)

            this.messages = (idx == this.messages.length - 1) ? [] : this.messages.slice(idx + 1)
                 
            this.total_context_tokens = reducer.sum
        }

        this.messages.push(chatCompletion)
        this.total_context_tokens += completionTokens
        log.warn(this.total_context_tokens)

        return message
    }

    register_tool(): void {

    }
}

export { GroqAILLM, GROQAI_DEFAULTS }