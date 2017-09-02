import { Collection, Profile } from "./interface";
import { ConcurrentQueue } from "./queue";
export declare class Swgoh {
    private _queue;
    constructor(_queue?: ConcurrentQueue);
    private getCheerio(uri);
    profile(username: string): Promise<Profile>;
    collection(username: string): Promise<Collection>;
    guild(guildUrl: string): any;
    guild(opts: {
        id: number;
        name: string;
    }): any;
}
export declare const swgoh: Swgoh;
