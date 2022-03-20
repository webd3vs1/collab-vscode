import idm from "./idm";
import { WebSocket, Event, MessageEvent, CloseEvent, ErrorEvent } from "ws";

class Api {
    private socket: WebSocket | null;
    private host: string;
    private auth: string;
    public listeners: ((data:any)=>any)[];
    public onopen: (e:Event)=>any;
    public onerror: (e:ErrorEvent)=>any
    public onclose: (e:CloseEvent)=>any;
    private onmessage: (e:MessageEvent)=>any;
    public onfilechange: (e:any)=>any;

    constructor() {
        this.socket = null;
        this.host = "";
        this.auth = "";
        this.listeners = [];
        this.onopen = (_e) => {
            console.log("Websocket open");
        };
        this.onerror = (_e) => {
            console.log("Websocket error happened");
        };
        this.onclose = (_e) => {
            console.log("Websocket closed");
        }
        this.onmessage = (e:MessageEvent) => {
            try {
                let data = JSON.parse(<string>e.data);
                if (data.id) {
                    this.listeners[data?.id]?.(data);
                } else {
                    this.onfilechange(data);
                }
            } catch (e) {
                console.log(e);
            }
        }
        this.onfilechange = () => {};
    }

    login(host: string, token: string): void {
        this.host = host.replace(/(\/|\\)+$/, "")+"/";
        this.auth = token;
        this.socket = new WebSocket(this.host, {
            auth: this.auth
        });

        this.socket.onopen = this.onopen;
        this.socket.onclose = this.onclose;
        this.socket.onerror = this.onerror;
        this.socket.onmessage = this.onmessage;
    }

    private send(obj: {
        type: "deleteToken" | "readDirectory" | "stat" | "readFile" | "writeFile" | "rename",
        id: number, data?: any
    }) {
        if(this.socket && this.socket.readyState == this.socket.OPEN) {
            this.socket.send(JSON.stringify(obj));
        }
    }

    private await(id: number, callback: (message:any) => any) {
        this.listeners[id] = callback;
    }

    deleteToken(): Promise<void> {
        return new Promise(async resolve => {
            let id = idm.grantID();
            this.send({ type: "deleteToken", id, data: this.auth });
            resolve();
        });
    }

    readDirectory(path: string): Promise<[string, number][]> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                resolve(message.data);
            });
            this.send({ type: "readDirectory", id, data: path });
        });
    }

    rename(path0: string, path1: string): Promise<any> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                resolve(message.data);
            });
            this.send({ type: "rename", id, data: [path0, path1] });
        });
    }

    createDirectory(_path: string): Promise<void> {
        return new Promise(() => {});
    }

    stat(path: string): Promise<any> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                resolve(message.data);
            });
            this.send({ type: "stat", id, data: path });
        });
    }

    writeFile(path: string, content: number[], options: { create?: boolean, overwrite?: boolean }): Promise<void> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                resolve(message.data);
            });
            this.send({
                type: "writeFile", id,
                data: { path, content, options }
            });
        });
    }

    readFile(path: string): Promise<number[]|any> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                resolve(message.data);
            });
            this.send({ type: "readFile", id, data: path });
        });
    }

    delete(_path: string, _options: { recursive: boolean }): Promise<void> {
        return new Promise(() => {});
    }

}

let api = new Api();
export default api;