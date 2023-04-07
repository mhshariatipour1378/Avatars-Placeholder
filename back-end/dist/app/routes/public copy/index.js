"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//controller
const publicController_1 = __importDefault(require("./../../http/controller/publicController"));
//validator
// const commentValidator = require("app/http/validator/commentValidator")
// const validateToken = require('app/http/middleware/validateToken')
//Random
router.get("/", publicController_1.default.index);
//By Gender
router.get("/boy", publicController_1.default.byGenderBoy);
router.get("/girl", publicController_1.default.byGenderGirl);
//By id
router.get("/:id", publicController_1.default.byId);
exports.default = router;
