import { Request, Response, NextFunction } from 'express';
const svg2img = require('svg2img');
import cacheService from '../../../services/cacheService';
import fs from 'fs';
import path from 'path';

class publicController{

    publicNameAvatar: string = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
    foramtFile:  string = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";

    // Helper function to set cache headers based on user preferences
    setCacheHeaders = (req: Request, res: Response, defaultMaxAge: number = 3600, isCacheHit: boolean = false, filePath?: string) => {
        // Check for cache control query parameters
        const noCache = req.query.no_cache === 'true' || req.query.nocache === 'true';
        const maxAge = req.query.max_age ? parseInt(req.query.max_age.toString()) : defaultMaxAge;
        const cdn = req.query.cdn === 'true' || req.headers['x-cdn-enabled'] === 'true';
        
        // Set cache status header
        res.setHeader('X-Cache-Status', isCacheHit ? 'HIT' : 'MISS');
        
        if (noCache) {
            // Disable caching
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Cache-Control', 'disabled');
        } else if (cdn) {
            // CDN-friendly caching
            res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
            res.setHeader('CDN-Cache-Control', `max-age=${maxAge * 2}`);
            res.setHeader('X-Cache-Control', 'cdn-enabled');
        } else {
            // Standard caching
            res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
            res.setHeader('X-Cache-Control', 'enabled');
        }
        
        // Generate consistent ETag based on file metadata or request parameters
        let etag: string;
        if (filePath && fs.existsSync(filePath)) {
            // For file-based requests, use file modification time and size
            const stats = fs.statSync(filePath);
            etag = `"${stats.mtime.getTime()}-${stats.size}"`;
        } else if (req.params.id) {
            // For specific ID requests, use the ID as part of ETag
            etag = `"${req.params.id}-${Date.now()}"`;
        } else if (req.query.username) {
            // For username-based requests, use username hash
            const usernameHash = req.query.username.toString().split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
            etag = `"username-${usernameHash}"`;
        } else {
            // For random requests, use a timestamp-based ETag (less optimal but still consistent)
            etag = `"random-${Math.floor(Date.now() / 60000)}"`; // Changes every minute
        }
        
        res.setHeader('ETag', etag);
        
        // Check if client has a valid cached version
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch === etag) {
            res.status(304).end();
            return true; // Indicate that response was sent
        }
        
        return false; // Continue with normal response
    };

    //helper function
    getImagePath = (folderName: string, startIndex: number, endIndex: number) => {
        // Check cache first
        const cacheKey = cacheService.generatePathKey(folderName, startIndex, endIndex);
        const cachedPath = cacheService.getPath(cacheKey);
        
        if (cachedPath) {
            return { path: cachedPath, isCacheHit: true };
        }

        //Generate Random
        const randomIndex: number = Math.floor(Math.random() * ((endIndex + 1) - startIndex)) + startIndex;
        
        const imageName: string = this.publicNameAvatar + randomIndex + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
        
        // Cache the path
        cacheService.setPath(cacheKey, path);
        
        return { path, isCacheHit: false };
    }

    get404Avatar = ()=>{
        const path: string = `${process.env.UPLOAD_DIR}/${process.env.AVATAR_404}`;
        return path;
    }

    getImageByUsername = (username: string, folderName: string, startIndex: number, endIndex: number)=>{

        // Check cache first
        const cacheKey = cacheService.generatePathKey(folderName, startIndex, endIndex, username);
        const cachedPath = cacheService.getPath(cacheKey);
        
        if (cachedPath) {
            return { path: cachedPath, isCacheHit: true };
        }

        //username convert to number value
        let usernameValue: number = 0;
        for(let i = 0; i < username.length; i++){
            usernameValue += username.charCodeAt(i);
        }

        const idAvatar:string = ((usernameValue % ((endIndex + 1) - startIndex)) + startIndex).toString()
        const imageName: string = this.publicNameAvatar + idAvatar + this.foramtFile;
        const path: string = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
        
        // Cache the path
        cacheService.setPath(cacheKey, path);
        
        return { path, isCacheHit: false };
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

            let pathResult = null;
            if(req.query.username){
                pathResult = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
            }else{
                if(req.headers?.referer){
                    console.log("=> Refer:", req.headers?.referer);
                }
                pathResult = this.getImagePath("id", startIndex, endIndex);
            }

            if(pathResult && pathResult.path){
                // Set cache headers based on user preferences
                const responseSent = this.setCacheHeaders(req, res, 3600, pathResult.isCacheHit, pathResult.path); // 1 hour default
                if (responseSent) return;
                
                res.
                status(200).
                sendFile(pathResult.path, {root: '.'});
            }

        }catch(err){
            res.
            status(200).
            sendFile(this.get404Avatar(), {root: '.'});
        }

    }

    // --- Add this method for robust cache-enabled image streaming ---
    sendImageWithCache = (
        req: Request,
        res: Response,
        filePath: string,
        cacheOptions: { maxAge: number; isCacheHit: boolean }
    ) => {
        res.setHeader('X-Debug-Handler', 'streaming'); // DEBUG HEADER
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        
        // Use setCacheHeaders to respect query parameters (no_cache, cdn, max_age)
        const responseSent = this.setCacheHeaders(req, res, cacheOptions.maxAge, cacheOptions.isCacheHit, filePath);
        if (responseSent) return;
        
        // Detect content type
        let contentType = 'image/png';
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (filePath.endsWith('.gif')) contentType = 'image/gif';
        else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
        res.setHeader('Content-Type', contentType);
        
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    }

    byId = (req: Request, res: Response, next: NextFunction) => {
        const idAvatar:number = parseInt(req.params.id);
        const startIndex: number = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX ) : 0;
        const endIndex: number = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX ) : 0;
        if(!startIndex || !endIndex || !idAvatar || (startIndex > endIndex)){
            res.status(200).sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        if( (startIndex > idAvatar) || (idAvatar > endIndex)){
            res.status(200).sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        const imageName: string = this.publicNameAvatar + idAvatar + this.foramtFile;
        const filePath: string = `${process.env.UPLOAD_DIR}/id/${imageName}`;
        this.sendImageWithCache(req, res, filePath, { maxAge: 86400, isCacheHit: true });
    }

    byGenderBoy = (req: Request, res: Response, next: NextFunction)=> {
        const startIndex: number = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
        const endIndex: number = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
        if(!startIndex || !endIndex || (startIndex > endIndex)){
            res.status(200).sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        let pathResult = null;
        if(req.query.username){
            pathResult = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
        }else{
            pathResult = this.getImagePath("boy", startIndex, endIndex);
        }
        if(pathResult && pathResult.path){
            this.sendImageWithCache(req, res, pathResult.path, { maxAge: 3600, isCacheHit: pathResult.isCacheHit });
        }
    }

    byGenderGirl = (req: Request, res: Response, next: NextFunction) => {
        const startIndex: number = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
        const endIndex: number = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
        if(!startIndex || !endIndex || (startIndex > endIndex)){
            res.status(200).sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        let pathResult = null;
        if(req.query.username){
            pathResult = this.getImageByUsername(`${req.query.username}`, "id",startIndex, endIndex)
        }else{
            pathResult = this.getImagePath("girl", startIndex, endIndex);
        }
        if(pathResult && pathResult.path){
            this.sendImageWithCache(req, res, pathResult.path, { maxAge: 3600, isCacheHit: pathResult.isCacheHit });
        }
    }

    //job avatrs
    jobsList: string[] = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];

    byJob = (req: Request, res: Response, next: NextFunction) => {
        const job : string = req.params.job;
        const gender: string = req.params.gender;
        if(!this.jobsList.includes(job) || !['male', 'female'].includes(gender)){
            res.status(200).sendFile(this.get404Avatar(), {root: '.'});
            return;
        }
        const filePath: string = `${process.env.UPLOAD_DIR}/job/${job}/${gender}${this.foramtFile}`;
        this.sendImageWithCache(req, res, filePath, { maxAge: 86400, isCacheHit: true });
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

        // Generate cache key
        const cacheKey = cacheService.generateSvgKey({
            username: req.query.username?.toString(),
            size,
            format,
            backgroundColor,
            fontColor,
            uppercase,
            bold,
            length
        });

        // Check cache first
        const cachedBuffer = cacheService.getSvgAvatar(cacheKey);
        if (cachedBuffer) {
            res.set('Content-Type', `image/${format}`);
            
            // Set cache headers for SVG avatars
            const responseSent = this.setCacheHeaders(req, res, 86400, true, undefined); // 24 hours default, cache hit
            if (responseSent) return;
            
            res.send(cachedBuffer);
            return;
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
                    // Cache the generated image
                    cacheService.setSvgAvatar(cacheKey, buffer);
                    
                    res.set('Content-Type', `image/${format}`);
                    
                    // Set cache headers for SVG avatars
                    const responseSent = this.setCacheHeaders(req, res, 86400, false, undefined); // 24 hours default, cache miss
                    if (responseSent) return;
                    
                    res.send(buffer);
                }
        });

    }

    // Test endpoint for cache functionality
    testCache = (req: Request, res: Response, next: NextFunction) => {
        // Set cache headers
        const responseSent = this.setCacheHeaders(req, res, 3600, true, undefined);
        if (responseSent) return;
        
        // Send a simple JSON response
        res.json({
            message: "Cache test endpoint",
            timestamp: new Date().toISOString(),
            cacheStatus: "HIT"
        });
    }

}

export default new publicController(); 