import fs from 'fs';
import { Client } from 'discord.js';
import log from 'loglevel'

interface Event {
    name: string;
    execute: (bot: Client, ...args: any[]) => Promise<any>;
}

async function handleEvents(bot: Client, dir: { absolutePath: string, path: string, name: string }) {
    const eventsFolder = fs.readdirSync(dir.absolutePath).filter(x => x.endsWith('.ts'));
    for (const file of eventsFolder) {
        let _event = await import(`../../commands/${dir.name}/events/${file}`);
        let event: Event = _event.default;
        bot.on(event.name.toString(), event.execute.bind(null, bot));
        log.info('[EVENT HANDLER]', `${event.name}`);
    }
}

export default handleEvents;