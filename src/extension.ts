// imports
import * as vscode from "vscode";
import api from "./api";
import CollabFs from "./fs";
import { login } from "./login";

// var activated = false;

// function called on extension activation
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    let item = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );
    item.text = "$(loading~spin) collab connecting";
    item.show();

    // set api host
    api.url = "collab-ext-server.herokuapp.com";
    // get stored token
    let token = await context.secrets.get("collab-token");
    // if it doesn't exist,
    if (!token || !(await api.validateToken(token))) {
        // try logging in
        token = await login(`https://${api.url}/`);
        // if it still fails, show error message with retry button
        if (!token) return vscode.window.showErrorMessage("Collab activation failed", "retry")
            .then(value => {
                // if user clicked "retry",
                if (value == "retry") {
                    // start over
                    return activate(context);
                } else return;
            });
        // new token created, store it
        await context.secrets.store("collab-token", token);
    }
    api.token = token;
    console.log(token);
    await api.connect();
    let load = vscode.commands.registerCommand("collab.load", async () => {
        // get all projects
        let projects = await api.readDirectory("/");
        console.log(projects);
        if (!projects) return;
        // give selection to user
        let quickpick = projects.filter(x => x[1] == 2).map(x => x[0]);
        let project = await vscode.window.showQuickPick(quickpick);
        if (!project) return;
        // add remote folder to workspace
        let start = vscode.workspace.workspaceFolders?.length || 0;
        vscode.workspace.updateWorkspaceFolders(start, 0, { uri: vscode.Uri.parse(`collab:/${project}/`), name: project });
    });
    // initialize remote filesystem
    let filesystem = new CollabFs();
    // register filesystem in vscode
    let fsprovider = vscode.workspace.registerFileSystemProvider(
        "collab", // scheme
        filesystem,
        { isCaseSensitive: true }
    );
    item.hide();

    context.subscriptions.push(
        fsprovider,
        load
    );
}

// function called on extension deactivation
export function deactivate() {}
