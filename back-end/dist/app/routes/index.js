"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//controller
const publicController_1 = __importDefault(require("./../http/controller/publicController"));
//public
const public_1 = __importDefault(require("./public"));
router.use('/public', public_1.default);
//username
const username_1 = __importDefault(require("./username"));
router.use('/username', username_1.default);
//api
const api_1 = __importDefault(require("./api"));
router.use('/api', api_1.default);
//404
router.all('*', (req, res, next) => {
    res.
        status(200).
        sendFile(publicController_1.default.get404Avatar(), { root: '.' });
    return;
});
exports.default = router;
