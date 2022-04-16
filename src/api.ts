import idm from "./idm";
import { WebSocket, Event, MessageEvent, CloseEvent, ErrorEvent } from "ws";
import axios from "axios";

class Api {
    private socket: WebSocket | null;
    private host: string;
    private auth: string;
    private ping: NodeJS.Timeout | null;
    public listeners: ((data:any)=>any)[];
    public onopen: (e:Event)=>any;
    public onerror: (e:ErrorEvent)=>any;
    public onclose: (e:CloseEvent)=>any;
    private onmessage: (e:MessageEvent)=>any;
    public onfilechange: (e:any)=>any;

    constructor() {
        this.socket = null;
        this.host = "";
        this.auth = "";
        this.ping = null;
        this.listeners = [];
        this.onopen = (_e) => {
            console.log("Websocket open");
        };
        this.onerror = (e) => {
            console.log("Websocket error happened:", e);
        };
        this.onclose = (e) => {
            console.log("Websocket closed:", e);
        }
        this.onmessage = (e:MessageEvent) => {
            try {
                let data = JSON.parse(<string>e.data);
                if (data.id) {
                    this.listeners[data?.id]?.(data);
                    delete this.listeners[data?.id];
                } else {
                    this.onfilechange(data);
                }
            } catch (e) {
                console.log(e);
            }
        }
        this.onfilechange = () => {};
    }

    connect(): Promise<void> {
        return new Promise(resolve => {

            this.socket = new WebSocket("wss://" + this.host + "/ws", {
                auth: this.auth
            });

            this.socket.onopen = this.onopen;
            this.socket.onclose = this.onclose;
            this.socket.onerror = this.onerror;
            this.socket.onmessage = this.onmessage;

            this.ping = setInterval(() => {
                let id = idm.grantID();
                this.await(id, _ => {
                    idm.revokeID(id);
                    console.log("pong: "+id)
                });
                this.send({ type: "ping", id });
                console.log("ping: "+id);
            }, 5000);
            setTimeout(() => {
                resolve();
            }, 7500);
        });
    }

    async validateToken(token: string): Promise<boolean> {
        let res = await axios.get("https://" + this.host + "/token", { headers: { Authorization: token } }).catch(() => {});
        if (res?.status == 200) return true;
        else return false;
    }

    private send(obj: {
        type: "readDirectory" | "stat" | "ping" | "readFile" | "writeFile" | "rename",
        id: number, data?: any
    }) {
        if(this.socket && this.socket.readyState == this.socket.OPEN) {
            this.socket.send(JSON.stringify(obj));
        }
    }

    private await(id: number, callback: (message: any) => any) {
        this.listeners[id] = callback;
    }

    readDirectory(path: string): Promise<[string, number][]> {
        return new Promise(resolve => {
            let id = idm.grantID();
            this.await(id, message => {
                idm.revokeID(id);
                console.log(message.data)
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

    set url(host: string) {
        this.host = host.replace(/(\/|\\)+$/, "");
    }
    set token(auth: string) {
        this.auth = auth;
    }
    get url() {
        return this.host;
    }

}

let api = new Api();
export default api;