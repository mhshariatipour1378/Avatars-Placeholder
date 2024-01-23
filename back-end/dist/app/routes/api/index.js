"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//controller
const apiController_1 = __importDefault(require("../../http/controller/apiController"));
//Random
router.get("/", apiController_1.default.index);
router.get("/jobs", apiController_1.default.getJobs);
exports.default = router;
