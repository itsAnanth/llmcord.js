import { Events } from "discord.js";
import { Client } from '@/Discord/Client';
import path from 'path'
import fs from 'fs';
import log from 'loglevel';

class Event {

    name: Events;
    execute: (bot: Client, ...args: any[]) => Promise<any>;
    static Events = Events;

    constructor(options: { name: Events, execute: (bot: Client, ...args: any[]) => Promise<any>; }) {
        this.name = options.name;

        this.execute = options.execute;
    }

    public static async handleEvents(bot: Client, dir: string) {
        const absolutePath = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
    
        const eventsFolder = fs.readdirSync(absolutePath).filter(x => x.endsWith('.ts'));
        for (const file of eventsFolder) {
            let _event = await import(`${absolutePath}/${file}`);
            let event: Event = _event.default;
            // @ts-ignore
            bot.on(event.name, event.execute.bind(null, bot));
            log.info('[EVENT HANDLER]', `${event.name}`);
        }
    }
}

export default Event;