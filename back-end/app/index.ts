const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
import router from "./routes"

const app = express()

export default class Application{
    constructor(){
        this.configServer();
        this.config();
        this.setRoutes();
    }

    configServer(){
        app.listen(process.env.PORT, (err: object)=>{
            if(err) console.log(err);
            console.log(`server run on port ${process.env.PORT} ....`)
            if(process.env.MODE == 'dev') console.log("Development mode is enabled :)")
        })
    }

    config(){
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(cors())
    }

    setRoutes(){
        app.use(router)
    }
    
}