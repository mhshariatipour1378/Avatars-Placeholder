const express = require('express')
import {Request, Response, NextFunction } from 'express';
const router = express.Router()

//controller
import publicController from "./../http/controller/publicController";

//public
import Public from "./public"
router.use('/public', Public)

//username
import Username from "./username"
router.use('/username', Username)

//api
import Api from "./api"
router.use('/api', Api)

//404
router.all('*', (req: Request, res: Response, next: NextFunction)=>{
    res.
    status(200).
    sendFile(publicController.get404Avatar(),  {root: '.'});
    return;
});

export default router;
  