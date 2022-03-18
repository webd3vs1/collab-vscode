import * as vscode from "vscode";
import api from "./api";

export default class CollabFs implements vscode.FileSystemProvider {
    emitter: vscode.EventEmitter<vscode.FileChangeEvent[]>;
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;
    openedProject: string;

    constructor(emitter: vscode.EventEmitter<vscode.FileChangeEvent[]>, project: string) {
        this.emitter = emitter;
        this.onDidChangeFile = this.emitter.event;
        this.openedProject = project;
    }
    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        return await api.readDirectory(path);
        //* todo test
    }
    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        let { content } = await api.readFile(path);
        if (!content) throw vscode.FileSystemError.FileNotFound(uri);
        return Uint8Array.from(content);
        //* todo test
    }
    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        
        //? todo end this?

    }
    async delete(uri: vscode.Uri, options: { recursive: boolean; }): Promise<void> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        await api.delete(path, options);
        return;
        //* todo test

    }
    async createDirectory(uri: vscode.Uri): Promise<void> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        await api.createDirectory(path);
        return;
        //* todo test
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Promise<void> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        await api.writeFile(path, Array.from(content), options);
        return;
        //* todo test

    }
    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        let path = uri.toString(true).split("/").slice(1).join("/");
        let stat = await api.stat(path).catch(err => {
            throw vscode.FileSystemError.FileNotFound(uri);
        });
        return {
            size: stat?.size,
            ctime: stat?.ctime,
            mtime: stat?.mtime,
            type: stat?.type
        };
        //* todo test
    }
    //! unused methods below



    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        console.log(uri.toString(true));
        return { dispose: () => {} }
    }
    copy(source: vscode.Uri, destination: vscode.Uri, options: { overwrite: boolean }): void {

    }
}
