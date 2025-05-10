interface BaseLLM {

    config: BaseLLMConfig;
    total_context_tokens: number;
    messages: any[];
    
    generate(...args: any[]): void;
    truncateContext(...args: any[]): any;
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