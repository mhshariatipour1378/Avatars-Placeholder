import { Request, Response, NextFunction } from 'express';
const svg2img = require('svg2img');

class publicController{

    publicNameAvatar: string = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
    foramtFile:  string = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";

    //helper function
    getImagePath = (folderName: string, startIndex: number, endIndex: number) => {
        //Generate Random
        const randomIndex: number = Math.floor(Math.random() * ((endIndex + 1) - startIndex)) + startIndex;
        
        const imageName: string = this.publicNameAvatar + randomIndex + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
        return path;
    }

    get404Avatar = ()=>{
        const path: string = `${process.env.UPLOAD_DIR}/${process.env.AVATAR_404}`;
        return path;
    }

    getImageByUsername = (username: string, folderName: string, startIndex: number, endIndex: number)=>{

        //username convert to number value
        let usernameValue: number = 0;
        for(let i = 0; i < username.length; i++){
            usernameValue += username.charCodeAt(i);
        }

        const idAvatar:string = ((usernameValue % ((endIndex + 1) - startIndex)) + startIndex).toString()
        const imageName: string = this.publicNameAvatar + idAvatar + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
        
        return path;
    }

    index = (req: Request, res: Response, next: NextFunction) => {

        try{
            const startIndex: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
            const endIndex: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;

            if(!startIndex || !endIndex || (startIndex > endIndex)){
                res.
                status(200).
                sendFile(this.get404Avatar(), {root: '.'});
                return;
            }

            let path = null;
            if(req.query.username){
                path = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
            }else{
                if(req.headers?.referer){
                    console.log("=> Refer:", req.headers?.referer);
                }
                path = this.getImagePath("id", startIndex, endIndex);
            }

            //console.log(path)
            if(path){
                res.
                status(200).
                sendFile(path, {root: '.'});
            }

        }catch(err){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
        }

    }

    byId = (req: Request, res: Response, next: NextFunction) => {

        const idAvatar:number = parseInt(req.params.id);

        const startIndex: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
        const endIndex: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;
     
        if(!startIndex || !endIndex || !idAvatar || (startIndex > endIndex)){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            
            return;
        }

        if( (startIndex > idAvatar) || (idAvatar > endIndex)){
            //console.log(this)
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        
        const imageName: string = this.publicNameAvatar + idAvatar + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/id/${imageName}`;
        //console.log(path)
        
        if(path){
            res.
            status(200).
            sendFile(path, {root: '.'});
        }

    }

    byGenderBoy = (req: Request, res: Response, next: NextFunction)=> {
        
        const startIndex: number = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
        const endIndex: number = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
    
        if(!startIndex || !endIndex || (startIndex > endIndex)){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        
        let path = null;
        if(req.query.username){
            path = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
        }else{
            path = this.getImagePath("boy", startIndex, endIndex);
        }

        //console.log(path)
        if(path){
            res.
            status(200).
            sendFile(path, {root: '.'});
        }
        
    }

    byGenderGirl = (req: Request, res: Response, next: NextFunction) => {
        
        const startIndex: number = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
        const endIndex: number = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
        
        if(!startIndex || !endIndex || (startIndex > endIndex)){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        
        let path = null;
        if(req.query.username){
            path = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
        }else{
            path = this.getImagePath("girl", startIndex, endIndex);
        }

        //console.log(path)
        if(path){
            res.
            status(200).
            sendFile(path, {root: '.'});
        }

    }

    //job avatrs
    jobsList: string[] = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];

    byJob = (req: Request, res: Response, next: NextFunction) => {
        
        const job : string = req.params.job;
        const gender: string = req.params.gender;

        if(!this.jobsList.includes(job) || !['male', 'female'].includes(gender)){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            return;
        }

        const path: string = `${process.env.UPLOAD_DIR}/job/${job}/${gender}${this.foramtFile}`;

        res.
        status(200).
        sendFile(path, {root: '.'});
        
    }

    //username
    checkValidColor = (color:string) => {
        var regex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return regex.test(color);
    }

    svgAvatar = (req: Request, res: Response, next: NextFunction) => {

        if(req.headers?.referer){
            console.log("=> Refer:", req.headers?.referer);
        }

        const defaultColorArray: object[] = [
            {
                color: '0B60B0',
                background: '9dc9f2'
            },
            {
                color: '6C22A6',
                background: 'd7a3ff'
            },
            {
                color: 'BF3131',
                background: 'f09999'
            },
            {
                color: '508D69',
                background: 'a1d1b5'
            }
        ];

        let defaultColor: object = defaultColorArray[Math.floor(Math.random() * 3)];
        let format: string = 'png';
        let username : string[]= [ String.fromCharCode(Math.random() * 26 + 65) , String.fromCharCode(Math.random() * 26 + 65)]; //Random

        const size: number = req.query.size ? (Number(req.query.size) > 32 ? (Number(req.query.size) < 1024 ? Number(req.query.size) : 1024) : 32 ) : 256;
        const uppercase: boolean = req.query.uppercase ? ( req.query.uppercase == "false" ? false : true ) : true;
        const bold: boolean = req.query.bold ? ( req.query.bold == "false" ? false : true ) : true;
        const length: number = req.query.length ? (Number(req.query.length) > 2 ? 2 : Number(req.query.length) ) : 2;
        
        //Username
        if(req.query.username){
            console.log("Username: ", req.query.username)
            username = req.query.username.toString().split(' ');

            if(username[0].length > 1){
                username.push(username[0].charAt(1))
            }else{
                username.push("")
            }

            defaultColor = defaultColorArray[req.query.username.toString().length % 4];
        }
        
        //Background
        // @ts-ignore
        let backgroundColor: string = defaultColor.background;
        if(req.query.background){
            backgroundColor = this.checkValidColor(req.query.background.toString()) ? req.query.background.toString() : backgroundColor;
        }

        //Color
        // @ts-ignore
        let fontColor: string = defaultColor.color;
        if(req.query.color){
            fontColor = this.checkValidColor(req.query.color.toString()) ? req.query.color.toString() : fontColor;
        }

        //Format
        if(req.query.format){
            format = ['png', 'jpg'].includes(req.query.format.toString()) ? req.query.format.toString() : 'png';
        }
        
        //Uppercase
        if(uppercase){
            username.forEach((item, index)=>{
                username[index] = item.toUpperCase()
            })
        }else{
            username.forEach((item, index)=>{
                username[index] = item.toLowerCase()
            })
        }

        //length
        if(length == 1){
            username[1] = "";
        }
        
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 250 250">
                <g id="icon" transform="translate(-177 -243)">
                    <g id="Group_1" data-name="Group 1">
                        <circle id="Ellipse_1" data-name="Ellipse 1" cx="125" cy="125" r="125" transform="translate(177 243)" fill="#${backgroundColor}"/>
                    </g>
                </g>
                <text x="50%" y="54%" fill="#${fontColor}" font-size="110" dominant-baseline="middle" text-anchor="middle">${username[0]?.charAt(0) + username[1]?.charAt(0)}</text> 
            </svg>
        `;

        // Convert SVG to Format
        svg2img(svgContent, 
            {
                format,
                resvg: {
                    font: {
                        fontFiles: [`./static/font/${ bold ? 'Roboto-Medium.ttf' : 'Roboto-Light.ttf'}`], 
                        loadSystemFonts: false,
                    },
                }

            }, (error: Error, buffer: Buffer)=> {
                if (error) {
                    res.status(500)
                    .sendFile(this.get404Avatar(), {root: '.'});
                } else {
                    res.set('Content-Type', `image/${format}`);
                    res.send(buffer);
                }
        });

    }

}

export default new publicController(); 