import axios from "axios";
import { io, Socket } from "socket.io-client";
import { resolve } from "path";

class Api {
	private socket: Socket | null;
	private host: string;
	public token: string;

	constructor() {
		this.socket = null;
		this.host = "";
		this.token = "";
	}

	connect(): void {
		this.socket = io("https://" + this.host + "/user", {
			auth: { token: this.token }
		});
	}

	async validateToken(token: string): Promise<boolean> {
		let res = await axios.get("https://" + this.host + "/token", {
			headers: { Authorization: token }
		}).catch(() => {});
		if (res?.status == 200) return true;
		else return false;
	}

	readDirectory(path: string): Promise<[string, number][]> {
		return new Promise(resolve => {
			this.socket?.emit("readDirectory", path,
				(data: [string, number][]
			) => {
				resolve(data);
			});
		});
	}

	rename(path0: string, path1: string): Promise<any> {
		return new Promise(resolve => {
			this.socket?.emit("rename", path0, path1, (data: any) => {
				resolve(data);
			});
		});
	}

	createDirectory(path: string): Promise<void> {
		return new Promise(resolve => {
			this.socket?.emit("createDirectory", path, () => {
				resolve();
			});
		});
	}

	stat(path: string): Promise<any> {
		return new Promise(resolve => {
			this.socket?.emit("stat", path, (stat: any) => {
				resolve(stat);
			});
		});
	}

	writeFile(path: string, content: number[], options: {
		create?: boolean, overwrite?: boolean
	}): Promise<void> {
		return new Promise(resolve => {
			this.socket?.send("writeFile", path, content, options, () => {
				resolve();
			});
		});
	}

	readFile(path: string): Promise<number[]|any> {
		return new Promise(resolve => {
			this.socket?.emit("readFile", path, (data: number[]|any) => {
				resolve(data);
			});
		});
	}

	delete(path: string, options: { recursive: boolean }): Promise<void> {
		return new Promise(() => {
			this.socket?.emit("delete", path, options, () => {
				resolve();
			});
		});
	}

	set url(host: string) {
		this.host = host.replace(/(\/|\\)+$/, "");
	}
	get url() {
		return this.host;
	}

}

let api = new Api();
export default api;
