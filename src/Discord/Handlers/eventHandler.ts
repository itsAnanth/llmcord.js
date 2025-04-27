import fs from 'fs';
import { Client } from 'discord.js';
import log from 'loglevel'
import path from 'path'

interface Event {
    name: string;
    execute: (bot: Client, ...args: any[]) => Promise<any>;
}

async function handleEvents(bot: any, dir: string) {
    const absolutePath = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);

    const eventsFolder = fs.readdirSync(absolutePath).filter(x => x.endsWith('.ts'));
    for (const file of eventsFolder) {
        let _event = await import(`${absolutePath}/${file}`);
        let event: Event = _event.default;
        bot.on(event.name.toString(), event.execute.bind(null, bot));
        log.info('[EVENT HANDLER]', `${event.name}`);
    }
}

export default handleEvents;