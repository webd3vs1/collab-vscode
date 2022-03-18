// imports
import * as vscode from "vscode";
import * as load from "./load";
import api from "./api";

// function called on extension activation
export async function activate(context: vscode.ExtensionContext) {
    // temp console.log
    console.log("Collab extension active");
    // dispose load.init() on deactivation
    context.subscriptions.push(
        await load.init()
    );
}

// function called on extension deactivation
export function deactivate() {
    // delete api token on session end
    api.deleteToken();
}
