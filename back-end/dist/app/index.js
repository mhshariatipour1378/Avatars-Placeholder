"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes_1 = __importDefault(require("./routes"));
const app = express();
class Application {
    constructor() {
        this.configServer();
        this.config();
        this.setRoutes();
    }
    configServer() {
        app.listen(process.env.PORT, (err) => {
            if (err)
                console.log(err);
            console.log(`server run on port ${process.env.PORT} ....`);
            if (process.env.MODE == 'dev')
                console.log("Development mode is enabled :)");
        });
    }
    config() {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cors());
    }
    setRoutes() {
        app.use(routes_1.default);
    }
}
exports.default = Application;
