interface BaseLLM {

    total_context_tokens: number;
    messages: any[];
    
    generate(...args: any[]): void;

    register_tool(): void;
}

interface BaseLLMConfig {
    model: string;
    stream: boolean;
    max_completion_tokens: number;
    max_context_tokens: number
}

export default BaseLLM
export { BaseLLM, BaseLLMConfig }