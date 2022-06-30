import axios from "axios";
import * as vscode from "vscode";
import api from "./api";
import CollabFs from "./fs";
import { open } from "./pane";

export async function activate(context: vscode.ExtensionContext) {
	let fs = new CollabFs();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(
		"collab", fs, { isCaseSensitive: true }
	));
	context.subscriptions.push(
		vscode.commands.registerCommand("collab.login", login)
	);
}

function login() {
	
}

// export async function deactivate() {

// }
