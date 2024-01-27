const express = require('express')
const router = express.Router()

//controller
import publicController from "./../../http/controller/publicController";

//validator
// const commentValidator = require("app/http/validator/commentValidator")
// const validateToken = require('app/http/middleware/validateToken')

//Random
router.get("/", publicController.index)

//By Gender
router.get("/boy", publicController.byGenderBoy)
router.get("/girl", publicController.byGenderGirl)

//By Job
router.get("/job/:job/:gender", publicController.byJob)

//By id
router.get("/:id", publicController.byId)
export default router; 