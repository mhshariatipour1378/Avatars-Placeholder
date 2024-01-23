import { Request, Response, NextFunction } from 'express';

class postController{

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
            path = this.getImagePath("id", startIndex, endIndex);
        }

        console.log(path)
        if(path){
            res.
            status(200).
            sendFile(path, {root: '.'});
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
            console.log(this)
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        
        const imageName: string = this.publicNameAvatar + idAvatar + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/id/${imageName}`;
        console.log(path)
        
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

}

export default new postController(); 