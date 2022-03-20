// imports
import * as vscode from "vscode";
import * as load from "./load";
import api from "./api";
import CollabFs from "./fs";

// function called on extension activation
export async function activate(context: vscode.ExtensionContext) {
    console.log("Collab extension active"); // temp

    let filesystem = new CollabFs();
    let fsprovider = vscode.workspace.registerFileSystemProvider(
        "collab", // scheme
        filesystem, // provider
        { isCaseSensitive: true }
    );

    //// vscode.workspace.onDidChangeTextDocument(event => {
    ////     console.log("edit: " + event.contentChanges[0]);
    ////     if (event.document == vscode.window.activeTextEditor?.document) {
    ////         vscode.window.activeTextEditor.edit(builder => {
    ////             // builder
    ////         });
    ////     }
    //// });
    // dispose load.init() on deactivation
    context.subscriptions.push(
        fsprovider,
        await load.init()
    );
}

// function called on extension deactivation
export function deactivate() {
    // delete api token on session end
    api.deleteToken();
}
