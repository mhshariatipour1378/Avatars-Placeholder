import { Request, Response, NextFunction } from 'express';

class postController{

    index = (req: Request, res: Response, next: NextFunction) => {

        const startIndex: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
        const endIndex: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;
        
        const startIndexBoy: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
        const endIndexBoy: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;
        
        const startIndexGirl: number = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
        const endIndexGirl: number = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;

        res.
        status(200).
        json({
            all:{
                strat: startIndex,
                end: endIndex
            },
            boy:{
                strat: startIndexBoy,
                end: endIndexBoy
            },
            girl:{
                strat: startIndexGirl,
                end: endIndexGirl
            },
        });

    }

}

export default new postController();