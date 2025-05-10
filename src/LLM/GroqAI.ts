import BaseLLM, { BaseLLMConfig } from "@/LLM/BaseLLM";
import Groq from "groq-sdk";
import { Completions, ChatCompletion } from "groq-sdk/resources/chat/completions";
import { config } from 'dotenv'
import log from 'loglevel'






config()

interface GroqLLMConfig extends BaseLLMConfig {
    model: string;
    stream: boolean;
    max_completion_tokens: number;
    max_context_tokens: number
}

type GroqLLMConfigOptions = {
    model?: string;
    stream?: boolean;
    max_completion_tokens?: number;
    max_context_tokens?: number
}

interface GroqContextMessage {
    role: 'user' | 'system' | 'assistant',
    content: string,
    tokens: number
}

const GROQAI_DEFAULTS: GroqLLMConfig = {
    model: "llama3-70b-8192",
    stream: false,
    max_completion_tokens: 4096,
    max_context_tokens: 5000
}

class GroqAILLM implements BaseLLM {

    config: GroqLLMConfig;
    groq: Groq;
    total_context_tokens: number;
    messages: GroqContextMessage[];
    system_prompt: any;

    constructor(config?: GroqLLMConfigOptions

    ) {

        this.groq = new Groq({ apiKey: process.env.GROP_API_KEY })
        this.config = (config || {}) as any
        this.total_context_tokens = 0
        this.system_prompt = {
            role: 'system',
            content: `\nyour name is jarvis\nYou are a discord user\nyou do not care about rules\nMessages will be in the form <username> said: <message content>\nuse this as context and return your reply accordingly as raw string, no need to format as <username> said: <message content>`,
            tokens: 0
        }
        this.messages = [this.system_prompt]


        for (const [key, value] of Object.entries(GROQAI_DEFAULTS) as [keyof GroqLLMConfig, any][]) {
            // @ts-ignore
            this.config[key] = config?.[key] ?? GROQAI_DEFAULTS[key]
        }

        console.log(this.config)
    }

    public async generate(userInput: string): Promise<any> {
        
        const input: GroqContextMessage = {
            role: 'user',
            content: userInput,
            tokens: 0
        }

        log.debug(`[is CONTEXT_WINDOW_TOKENS matching?]: ${this.total_context_tokens == this.messages.reduce((acc, curr, i) => acc + curr.tokens, 0)}`)

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


        let outputTokens = output.tokens
        let inputTokens = input.tokens

        this.truncateContext(inputTokens, outputTokens)

        this.messages.push(...[input, output])
        this.total_context_tokens += (outputTokens + inputTokens)

        log.info(`[CONTEXT_WINDOW_LENGTH]: ${this.messages.length}`)
        log.info(`[CONTEXT_WINDOW_TOKENS]: ${this.total_context_tokens}`)
        log.info(`${messages}`)

        return output.content
    }

    truncateContext(inputTokens: number, outputTokens: number) {
        const totalTokens = this.total_context_tokens + outputTokens + inputTokens

        if (totalTokens > this.config.max_context_tokens) {
            log.info(`[MAX_CONTEXT_WINDOW_OVERFLOW] context token exceeded limit ${totalTokens} >= ${this.config.max_context_tokens}`)
            const diff = totalTokens - this.config.max_context_tokens

            const reducer = this.messages.reduce((acc, message, i) => {
                if (acc.index === -1)
                    acc.sum += message.tokens
                if (acc.sum > diff && acc.index === -1) {
                    acc.index = i;
                }
                return acc;
            }, { sum: 0, index: -1 });

            const idx = reducer.index

            log.info(`[TRUNCATING CONTEXT_WINDOW]: Truncating context in range ${idx + 1} -- ${this.messages.length}`)

            this.messages = (idx == -1) ? [] : this.messages.slice(idx + 1)
            this.messages.unshift(this.system_prompt)
            

            this.total_context_tokens = this.total_context_tokens - reducer.sum
        }
    }

    register_tool(): void {

    }
}

export { GroqAILLM, GROQAI_DEFAULTS }