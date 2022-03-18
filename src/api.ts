import idm from "./idm";
import { WebSocket, Event, MessageEvent, CloseEvent, ErrorEvent } from "ws";
import { resolve } from "path";


class Api {
    private socket: WebSocket | null = null;
    private host: string = "";
    private auth: string = "";
    private listeners: (()=>any)[] = [];

    login(host: string, token: string, onopen: () => any, onerror: () => any): void {
        this.host = host.replace(/(\/|\\)+$/, "")+"/";
        this.auth = token;
        this.socket = new WebSocket(this.host, {
            auth: this.auth
        });
        this.socket.onopen = onopen ?? this.onopen;
        this.socket.onclose = this.onclose;
        this.socket.onerror = onerror ?? this.onerror;
        this.socket.onmessage = this.onmessage;
    }

    private onopen(e: Event) {
        console.log(e);
    }

    private onclose(e: CloseEvent) {
        console.log(e);
    }

    private onmessage(e: MessageEvent) {
        console.log(e);
        // this.listeners?.[e.data?.id]
    }

    private onerror(e: ErrorEvent) {
        console.log(e);
    }

    private send(obj: { type: string, id: number, data?: any }) {
        if(this.socket && this.socket.readyState == this.socket.OPEN) {
            this.socket.send(obj);
        }
    }

    private await(id: number, callback: () => any) {
        this.listeners[id] = callback;
    }

    deleteToken(): Promise<void> {
        return new Promise(async resolve => {
            let id = idm.grantID();
            this.await(id, () => {
                resolve();
            });
            this.send({ type: "deleteToken", id });
        });
    }

    readDirectory(path: string): Promise<[string, number][]> {
        return new Promise(() => {
            let id = idm.grantID();
            this.await(id, () => {
                resolve();
            });
            this.send({ type: "readDirectory", id, data: path })
        });
    }
    
    createDirectory(path: string): Promise<void> {
        return new Promise(() => {});
    }

    stat(path: string): Promise<any> {
        return new Promise(() => {});
    }

    writeFile(path: string, content: number[], options: { create?: boolean, overwrite?: boolean }): Promise<void> {
        return new Promise(() => {});
    }

    readFile(path: string): Promise<{ content: number[] }> {
        return new Promise(() => {});
    }

    delete(path: string, options: { recursive: boolean }): Promise<void> {
        return new Promise(() => {});
    }

}

let api = new Api();
export default api;