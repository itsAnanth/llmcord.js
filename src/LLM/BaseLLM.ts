interface BaseLLM {

    total_context_tokens: number;
    messages: any[];
    
    generate(...args: any[]): void;

    register_tool(): void;
}

export default BaseLLM