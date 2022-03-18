import * as vscode from "vscode";
import * as express from "express";
import { once, EventEmitter } from "events";
import { Server } from "http";
import * as cors from "cors";
import api from "./api";

let events = new EventEmitter();

function listen(): Promise<Server> {
    return new Promise(resolve => {
        let app = express();
        app.use(express.json());
        app.use(cors());
        app.post("/", (q, s) => {
            s.status(200);
            events.emit("token", { token: q.body.token });
            s.json({ status: 200, message: "OK", token: q.body.token });
        });
        let server = app.listen(54732, () => {
            resolve(server);
        });
    })
}

export function login(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        // let url = "collab-ext-server.herokuapp.com/";
        let url = "localhost:3000";
        let secure = ""; //"s"
        let server = await listen();
        once(events, "token").then(async ([value]) => {
            server.close();
            api.login(`ws${secure}://${url}/ws`, value?.token, resolve, reject);
        });
        vscode.env.openExternal(vscode.Uri.parse(`http${secure}://${url}`));
    });
}
