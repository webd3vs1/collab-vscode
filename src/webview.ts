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
	let url = panel.webview.asWebviewUri(vscode.Uri.file(
		path + "/resources"
	));
	panel.webview.html = html(url.toString());
	return panel;
}
function html(url: string): string {
	return [
		`<html>`,
		`<head>`,
		`	<link rel="stylesheet" href="${url+"/webview.css"}"`,
		`</head>`,
		`<body>`,
		`	<div id="sidebar" class="preload"></div>`,
		`	<div id="content"></div>`,
		`	<script src="${url+"/webview.js"}"></script>`,
		`</body>`,
		"</html>"
	].join("");
}
export { open }
