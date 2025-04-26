import BaseLLM from "@/LLM/BaseLLM";

class OpenAILLM implements BaseLLM {

    total_context_tokens: number;
    messages: any[];

    constructor() {

        this.total_context_tokens = 0
        this.messages = []
    }

    generate(): void {
        
    }

    register_tool(): void {
        
    }
}