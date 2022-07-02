import { join } from "path";
import * as vscode from "vscode";
import { UserApi } from "./api";
import { CollabFs } from "./fs";
import { open } from "./webview";

export async function activate(context: vscode.ExtensionContext) {
	console.log("collab extension activated");
	let fs = new CollabFs();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(
		"collab", fs, { isCaseSensitive: true }
	));
	context.subscriptions.push(fs);
	context.subscriptions.push(
		vscode.commands.registerCommand("collab.login", () => login(context))
	);
}

async function login(context: vscode.ExtensionContext) {
	let scopes: string[] = ["user","repo"];
	let session = await vscode.authentication.getSession("github", scopes, {
		createIfNone: true
	});
	if (session) {
		let api = new UserApi();
		api.setUrl("https://collab-ext-server.herokuapp.com");
		api.token = session.accessToken;
		let panel = open(context.extensionPath);
		panel.webview.postMessage({ type: "icons:url", url: panel.webview.asWebviewUri(
			vscode.Uri.file(join(context.extensionPath, "resources", "icons"))
		).toString() });

		await api.connect();
		api.on("user:data", (data) => {
			panel.webview.postMessage({ ...data, type: "user:data" });
		});
		context.subscriptions.push(panel.onDidDispose(() => {
			api.dispose();
		}));
		context.subscriptions.push(api);
		context.subscriptions.push(panel);
		context.subscriptions.push(panel.webview.onDidReceiveMessage(async message => {
			if (message.type == "user:repos") {
				let repos = await api.getRepos();
				panel.webview.postMessage({ repos, type: "user:repos" });
			} if (message.type == "user:profile") {
				let profile = await api.getProfile();
				panel.webview.postMessage({ ...profile, type: "user:profile" });
			}
		}));
	}
}
