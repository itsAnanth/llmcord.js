import { GroqAILLM } from "@/LLM";
import log from 'loglevel'

/**
 * Log levels
 * 
 * log.trace(msg)
 * log.debug(msg)
 * log.info(msg)
 * log.warn(msg)
 * log.error(msg)
 */

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