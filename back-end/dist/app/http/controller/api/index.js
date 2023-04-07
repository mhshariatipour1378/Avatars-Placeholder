"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class postController {
    constructor() {
        this.publicNameAvatar = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
        this.foramtFile = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";
        //helper function
        this.getImagePath = (folderName, startIndex, endIndex) => {
            //Generate Random
            const randomIndex = Math.floor(Math.random() * ((endIndex + 1) - startIndex)) + startIndex;
            const imageName = this.publicNameAvatar + randomIndex + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            return path;
        };
        this.get404Avatar = () => {
            const path = `${process.env.UPLOAD_DIR}/${process.env.AVATAR_404}`;
            return path;
        };
        this.getImageByUsername = (username, folderName, startIndex, endIndex) => {
            //username convert to number value
            let usernameValue = 0;
            for (let i = 0; i < username.length; i++) {
                usernameValue += username.charCodeAt(i);
            }
            const idAvatar = ((usernameValue % ((endIndex + 1) - startIndex)) + startIndex).toString();
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            return path;
        };
        this.index = (req, res, next) => {
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let path = null;
            if (req.query.username) {
                path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
            }
            else {
                path = this.getImagePath("id", startIndex, endIndex);
            }
            console.log(path);
            if (path) {
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        this.byId = (req, res, next) => {
            const idAvatar = parseInt(req.params.id);
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            if (!startIndex || !endIndex || !idAvatar || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            if ((startIndex > idAvatar) || (idAvatar > endIndex)) {
                console.log(this);
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/id/${imageName}`;
            console.log(path);
            if (path) {
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        this.byGenderBoy = (req, res, next) => {
            const startIndex = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
            const endIndex = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let path = null;
            if (req.query.username) {
                path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
            }
            else {
                path = this.getImagePath("boy", startIndex, endIndex);
            }
            //console.log(path)
            if (path) {
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        this.byGenderGirl = (req, res, next) => {
            const startIndex = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
            const endIndex = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let path = null;
            if (req.query.username) {
                path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
            }
            else {
                path = this.getImagePath("girl", startIndex, endIndex);
            }
            //console.log(path)
            if (path) {
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
    }
}
exports.default = new postController();
