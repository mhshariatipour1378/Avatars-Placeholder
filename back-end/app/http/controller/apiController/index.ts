import { Request, Response, NextFunction } from 'express';

class postController{

    publicNameAvatar: string = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
    foramtFile:  string = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";

    index = (req: Request, res: Response, next: NextFunction) => {

        const startIndex: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
        const endIndex: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;
        
        const startIndexBoy: number = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
        const endIndexBoy: number = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
        
        const startIndexGirl: number = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
        const endIndexGirl: number = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;

        let allAvatars: string[] = [];
        let boyAvatars: string[] = [];
        let girlAvatars: string[] = [];

        for(let i = startIndex; i <= endIndex; i++){
            const path: string = `/public/${i}`;
            allAvatars.push(path);
        }

        for(let i = startIndexBoy; i <= endIndexBoy; i++){
            const path: string = `/public/${i}`;
            boyAvatars.push(path);
        }

        for(let i = startIndexGirl; i <= endIndexGirl; i++){
            const path: string = `/public/${i}`;
            girlAvatars.push(path);
        }

        res.
        status(200).
        json({
            all: allAvatars,
            boy: boyAvatars,
            girl: girlAvatars,
        });

    }

    getJobs = (req: Request, res: Response, next: NextFunction) => {
        const jobsList: string[] = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];

        res.
        status(200).
        json({
            jobsList
        });

    }

}

export default new postController();