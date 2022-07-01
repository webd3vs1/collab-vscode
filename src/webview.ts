import { readFileSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";


function open(path: string) {
	let panel = vscode.window.createWebviewPanel(
		"collab", "collab", vscode.ViewColumn.Beside,
		{ enableScripts: true, retainContextWhenHidden: true }
	);
	panel.iconPath = {
		dark: vscode.Uri.file(join(path, "resources", "icon.svg")),
		light: vscode.Uri.file(join(path, "resources", "icon.svg"))
	};
	panel.webview.html = readFileSync(join(path, "resources", "webview.html"), "utf8");
	return panel;
}

export { open }
