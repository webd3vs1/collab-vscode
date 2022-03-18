// imports
import * as vscode from "vscode";
import fs from "./fs";
import api from "./api";
import { login } from "./login";

export async function init(): Promise<vscode.Disposable> {
    // activate callback on command
    return vscode.commands.registerCommand("collab.load", async () => {
        // login into api
        await login().catch();
        // get all projects
        let projects = await api.readDirectory("/");
        if (!projects) return;
        // give selection to user
        let quickpick = projects.map((x: any) => x.name);
        let proj = await vscode.window.showQuickPick(quickpick);
        if (!proj) return;
        // register custom file system
        let ee = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
        let project = new fs(ee, proj);
        vscode.workspace.registerFileSystemProvider("collab", project, {
            isCaseSensitive: true
        });
        let start = vscode.workspace.workspaceFolders?.length || 0;
        vscode.workspace.updateWorkspaceFolders(start, 0, { uri: vscode.Uri.parse('collab:/'), name: proj });
    });
}