const express = require('express')
const router = express.Router()

//controller
import apiController from "../../http/controller/apiController";

//Random
router.get("/", apiController.index)
export default router;
  