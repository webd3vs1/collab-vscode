// imports
import * as vscode from "vscode";
import api from "./api";
import { login } from "./login";

export async function init(): Promise<vscode.Disposable> {
    // activate callback on command
    return vscode.commands.registerCommand("collab.load", async () => {
        // login into api
        await login();
        // get all projects
        let projects = await api.readDirectory("/");
        console.log(projects);
        if (!projects) return;
        // give selection to user
        let quickpick = projects.map(x => x[0]);
        let project = await vscode.window.showQuickPick(quickpick);
        if (!project) return;
        // add remote folder to workspace
        let start = vscode.workspace.workspaceFolders?.length || 0;
        vscode.workspace.updateWorkspaceFolders(start, 0, { uri: vscode.Uri.parse(`collab:/${project}/`), name: project });
    });
}