import * as vscode from "vscode";
import { FileSystemApi } from "./api";

export class CollabFs implements vscode.FileSystemProvider {
	emitter: vscode.EventEmitter<vscode.FileChangeEvent[]>;
	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;
	private api: FileSystemApi;

	constructor() {
		this.api = new FileSystemApi();
		this.emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
		this.onDidChangeFile = this.emitter.event;
	}
	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		console.log("readDirectory", path);
		return await this.api.readDirectory(path);
	}
	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		console.log("readFile", path);
		let data = await this.api.readFile(path);
		if (data.error) throw vscode.FileSystemError.FileNotFound(uri);
		return Uint8Array.from(data);
	}
	async rename(oldUri: vscode.Uri, newUri: vscode.Uri, _options: {
		overwrite: boolean;
	}): Promise<void> {
		let oldPath = `/${oldUri.toString(true).split("/").slice(1).join("/")}`;
		let newPath = `/${newUri.toString(true).split("/").slice(1).join("/")}`;
		console.log("rename", oldPath, newPath);
		await this.api.rename(oldPath, newPath);
		return;
	}
	async delete(uri: vscode.Uri, options: {
		recursive: boolean;
	}): Promise<void> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		console.log("delete", path);
		await this.api.delete(path, options);
		return;
		// todo test
	}
	async createDirectory(uri: vscode.Uri): Promise<void> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		console.log("createDirectory", path);
		await this.api.createDirectory(path);
		return;
		// todo test
	}

	async writeFile(uri: vscode.Uri, content: Uint8Array, options: {
		create: boolean; overwrite: boolean;
	}): Promise<void> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		await this.api.writeFile(path, Array.from(content), options);
		return;
	}
	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		let path = `/${uri.toString(true).split("/").slice(1).join("/")}`;
		console.log("stat", path);
		let stat = await this.api.stat(path);
		if (stat?.error) throw vscode.FileSystemError.FileNotFound(uri);
		return {
			size: stat?.size,
			ctime: stat?.ctime,
			mtime: stat?.mtime,
			type: stat?.type
		};
		// todo test
	}
	dispose() {
		this.api.dispose();
	}


	//! unused methods below

	watch(_uri: vscode.Uri, _options: {
		recursive: boolean; excludes: string[];
	}): vscode.Disposable {
		return { dispose: () => {} }
	}
	copy(_source: vscode.Uri, _destination: vscode.Uri, _options: {
		overwrite: boolean
	}): void {}
}
