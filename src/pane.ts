import { readFileSync } from "fs";
import * as vscode from "vscode";


function open() {
	let panel = vscode.window.createWebviewPanel(
		"collab", "Login to collab", vscode.ViewColumn.Beside,
		{ enableScripts: true }
	);
	panel.webview.html = readFileSync(__dirname+"/../resources/panel.html", "utf8");
	// panel.webview.
}

export { open }
