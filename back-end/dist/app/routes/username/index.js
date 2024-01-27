"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//controller
const publicController_1 = __importDefault(require("./../../http/controller/publicController"));
//SVG
router.get("/", publicController_1.default.svgAvatar);
exports.default = router;
