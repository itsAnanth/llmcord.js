import { Message } from 'discord.js';
import { getUser, getMember } from '@/Discord/Messages/Message';

declare module 'discord.js' {
    interface Message {
        getMember: typeof getMember;
        getUser: typeof getUser;
    }
}