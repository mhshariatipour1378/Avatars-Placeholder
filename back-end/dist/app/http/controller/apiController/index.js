"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class postController {
    constructor() {
        this.publicNameAvatar = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
        this.foramtFile = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";
        this.index = (req, res, next) => {
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            const startIndexBoy = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
            const endIndexBoy = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
            const startIndexGirl = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
            const endIndexGirl = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
            let allAvatars = [];
            let boyAvatars = [];
            let girlAvatars = [];
            for (let i = startIndex; i <= endIndex; i++) {
                const path = `/public/${i}`;
                allAvatars.push(path);
            }
            for (let i = startIndexBoy; i <= endIndexBoy; i++) {
                const path = `/public/${i}`;
                boyAvatars.push(path);
            }
            for (let i = startIndexGirl; i <= endIndexGirl; i++) {
                const path = `/public/${i}`;
                girlAvatars.push(path);
            }
            res.
                status(200).
                json({
                all: allAvatars,
                boy: boyAvatars,
                girl: girlAvatars,
            });
        };
        this.getJobs = (req, res, next) => {
            const jobsList = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];
            res.
                status(200).
                json({
                jobsList
            });
        };
    }
}
exports.default = new postController();
