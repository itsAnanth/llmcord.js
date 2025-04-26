import { Message } from 'discord.js';

async function getMember(this: Message, string: string) {
    const member = await this.guild?.members.fetch(string.replace(/\D/g, '')).catch(() => { });
    return member ? member : null;
};

async function getUser(this: Message, string: string) {
    const user = await this.client.users.fetch(string.replace(/\D/g, '')).catch(() => { });
    return user ? user : null;
};

let hooks = [
    getMember,
    getUser
]

function InitMessageHooks() {
    for (const hook of hooks)
        // @ts-ignore
        Message.prototype[hook.name] = hook
}

export default InitMessageHooks;
export { getUser, getMember }