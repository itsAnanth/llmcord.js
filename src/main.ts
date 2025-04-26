import { GroqAILLM } from "@/LLM";
import log from 'loglevel'

log.setLevel('INFO')

const llm = new GroqAILLM();

(async function() {
    let msg = await llm.generate("What are LLMs?")
    console.log(llm.messages)
    
    msg = await llm.generate("Who is einstein?")
    console.log(llm.messages)
    

    msg = await llm.generate("What is an encyclopedia?")
    console.log(llm.messages)
    

})()