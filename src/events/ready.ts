import { Event } from "@/Discord/Event";
import log from 'loglevel';

export default new Event({
    name: Event.Events.ClientReady,
    async execute(bot, ...args) {
        log.info('[DISCORD CLIENT] client ready!')
    },
})