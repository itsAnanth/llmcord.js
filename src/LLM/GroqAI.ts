import BaseLLM from "@/LLM/BaseLLM";
import Groq from "groq-sdk";
import { Completions, ChatCompletion } from "groq-sdk/resources/chat/completions";
import { config } from 'dotenv'
import log from 'loglevel'






config()

type GroqLLMConfig = {
    model: string;
    stream: boolean;
    max_completion_tokens: number;
    max_context_tokens: number
}

interface GroqContextMessage {
    role: 'user' | 'system' | 'assistant',
    content: string,
    tokens: number
}

const GROQAI_DEFAULTS: GroqLLMConfig = {
    model: "llama-3.3-70b-versatile",
    stream: false,
    max_completion_tokens: 4096,
    max_context_tokens: 5000
}

class GroqAILLM implements BaseLLM {

    config: GroqLLMConfig;
    groq: Groq;
    total_context_tokens: number;
    messages: GroqContextMessage[];

    constructor(config: GroqLLMConfig = GROQAI_DEFAULTS) {

        this.groq = new Groq({ apiKey: process.env.GROP_API_KEY })
        this.config = config
        this.total_context_tokens = 0
        this.messages = []
    }



    public async generate(userInput: string): Promise<any> {

        const input: GroqContextMessage = {
            role: 'user',
            content: userInput,
            tokens: 0
        }
        
        log.debug(`[is CONTEXT_WINDOW_TOKENS matching?]: ${this.total_context_tokens == this.messages.reduce((acc, curr, i) => acc + curr.tokens, 0)}`)
        log.info(`[CONTEXT_WINDOW_LENGTH]: ${this.messages.length}`)
        log.info(`[CONTEXT_WINDOW_TOKENS]: ${this.total_context_tokens}`)
        const messages = [...this.messages, input].map(x => ({ role: x.role, content: x.content }))
        const chatCompletion = await this.groq.chat.completions.create({
            messages: messages,
            model: this.config.model,
            max_completion_tokens: this.config.max_completion_tokens
        })

        const output: GroqContextMessage = {
            role: 'assistant',
            content: chatCompletion.choices[0]?.message?.content || "",
            tokens: 0
        }

        output.tokens = chatCompletion.usage?.completion_tokens || 0
        input.tokens = chatCompletion.usage?.prompt_tokens || 0


        let completionTokens = output.tokens
        let inputTokens = input.tokens

        const totalTokens = this.total_context_tokens + completionTokens + inputTokens

        if (totalTokens > this.config.max_context_tokens) {
            log.info(`[MAX_CONTEXT_WINDOW_OVERFLOW] context token exceeded limit ${totalTokens} >= ${this.config.max_context_tokens}`)
            const diff = totalTokens - this.config.max_context_tokens
            
            const reducer = this.messages.reduce((acc, message, i) => {
                acc.sum += message.tokens
                if (acc.sum > diff && acc.index === -1) {
                    acc.index = i;
                }
                return acc;
            }, { sum: 0, index: -1 });

            const idx = reducer.index

            log.info(`[TRUNCATING CONTEXT_WINDOW]: Truncating context in range ${idx + 1} -- ${this.messages.length}`)

            this.messages = (idx == -1) ? [] : this.messages.slice(idx + 1)

            this.total_context_tokens = this.total_context_tokens - reducer.sum
        }

        this.messages.push(...[input, output])
        this.total_context_tokens += (completionTokens + inputTokens)

        return output.content
    }

    register_tool(): void {

    }
}

export { GroqAILLM, GROQAI_DEFAULTS }