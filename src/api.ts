import axios from "axios";
import { io, Socket } from "socket.io-client";
import { resolve } from "path";

class UserApi {
	private socket: Socket | null;
	private host: string;
	public token: string;

	constructor() {
		this.socket = null;
		this.host = "";
		this.token = "";
	}

	connect(): Promise<void> {
		return new Promise(resolve => {
			this.socket = io(this.host + "/user", {
				auth: { token: this.token }
			});
			this.socket.connect();
			this.socket.on("connect", () => {
				resolve();
			});
		});
	}
	dispose(): void {
		this.socket?.disconnect();
		this.socket = null;
		this.token = "";
	}

	setUrl(host: string) { this.host = host.replace(/\/+$/, ""); }

	on(event: "user:data", callback: (...args: any[]) => void) {
		this.socket?.on(event, callback);
	}
	getRepos(): Promise<any[]> {
		return new Promise(resolve => {
			this.socket?.emit("user:repos", (repos: any[]) => resolve(repos));
		});
	}
	getProfile(): Promise<any> {
		return new Promise(resolve => {
			this.socket?.emit("user:profile", (profile: any) => resolve(profile))
		});
	}
}

class FileSystemApi {
	private socket: Socket | null;
	private host: string;
	public token: string;

	constructor() {
		this.socket = null;
		this.host = "";
		this.token = "";
	}

	connect(): Promise<void> {
		return new Promise(resolve => {
			this.socket = io(this.host + "/filesystem", {
				auth: { token: this.token }
			});
			this.socket.connect();
			this.socket.on("connect", () => {
				resolve();
			});
		});
	}
	dispose() {
		this.socket?.disconnect();
		this.socket = null;
		this.token = "";
	}

	async validateToken(token: string): Promise<boolean> {
		let res = await axios.get(this.host + "/token", {
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

	setUrl(host: string) { this.host = host.replace(/(\/|\\)+$/, ""); }

}

export { UserApi, FileSystemApi };
