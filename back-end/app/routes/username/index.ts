const express = require('express')
const router = express.Router()

//controller
import publicController from "./../../http/controller/publicController";

//SVG
router.get("/", publicController.svgAvatar)
export default router; 