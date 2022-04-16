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
            events.emit("token", q.body.token);
            s.json({ status: 200, message: "OK", token: q.body.token });
        });
        let server = app.listen(54732, () => {
            resolve(server);
        });
    })
}

export function login(url: string): Promise<string> {
    return new Promise(async resolve => {
        let server = await listen();
        once(events, "token").then(async ([value]) => {
            server.close();
            resolve(value);
        });
        vscode.env.openExternal(vscode.Uri.parse(url));
    });
}
