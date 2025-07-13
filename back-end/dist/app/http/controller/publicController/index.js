"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const svg2img = require('svg2img');
const cacheService_1 = __importDefault(require("../../../services/cacheService"));
const fs_1 = __importDefault(require("fs"));
class publicController {
    constructor() {
        this.publicNameAvatar = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
        this.foramtFile = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";
        // Helper function to set cache headers based on user preferences
        this.setCacheHeaders = (req, res, defaultMaxAge = 3600, isCacheHit = false) => {
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
            }
            else if (cdn) {
                // CDN-friendly caching
                res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
                res.setHeader('CDN-Cache-Control', `max-age=${maxAge * 2}`);
                res.setHeader('X-Cache-Control', 'cdn-enabled');
            }
            else {
                // Standard caching
                res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
                res.setHeader('X-Cache-Control', 'enabled');
            }
            // Set ETag for cache validation
            const etag = `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
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
        this.getImagePath = (folderName, startIndex, endIndex) => {
            // Check cache first
            const cacheKey = cacheService_1.default.generatePathKey(folderName, startIndex, endIndex);
            const cachedPath = cacheService_1.default.getPath(cacheKey);
            if (cachedPath) {
                return { path: cachedPath, isCacheHit: true };
            }
            //Generate Random
            const randomIndex = Math.floor(Math.random() * ((endIndex + 1) - startIndex)) + startIndex;
            const imageName = this.publicNameAvatar + randomIndex + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            // Cache the path
            cacheService_1.default.setPath(cacheKey, path);
            return { path, isCacheHit: false };
        };
        this.get404Avatar = () => {
            const path = `${process.env.UPLOAD_DIR}/${process.env.AVATAR_404}`;
            return path;
        };
        this.getImageByUsername = (username, folderName, startIndex, endIndex) => {
            // Check cache first
            const cacheKey = cacheService_1.default.generatePathKey(folderName, startIndex, endIndex, username);
            const cachedPath = cacheService_1.default.getPath(cacheKey);
            if (cachedPath) {
                return { path: cachedPath, isCacheHit: true };
            }
            //username convert to number value
            let usernameValue = 0;
            for (let i = 0; i < username.length; i++) {
                usernameValue += username.charCodeAt(i);
            }
            const idAvatar = ((usernameValue % ((endIndex + 1) - startIndex)) + startIndex).toString();
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            // Cache the path
            cacheService_1.default.setPath(cacheKey, path);
            return { path, isCacheHit: false };
        };
        this.index = (req, res, next) => {
            var _a, _b;
            try {
                const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
                const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
                if (!startIndex || !endIndex || (startIndex > endIndex)) {
                    res.
                        status(200).
                        sendFile(this.get404Avatar(), { root: '.' });
                    return;
                }
                let pathResult = null;
                if (req.query.username) {
                    pathResult = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
                }
                else {
                    if ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.referer) {
                        console.log("=> Refer:", (_b = req.headers) === null || _b === void 0 ? void 0 : _b.referer);
                    }
                    pathResult = this.getImagePath("id", startIndex, endIndex);
                }
                if (pathResult && pathResult.path) {
                    // Set cache headers based on user preferences
                    const responseSent = this.setCacheHeaders(req, res, 3600, pathResult.isCacheHit); // 1 hour default
                    if (responseSent)
                        return;
                    res.
                        status(200).
                        sendFile(pathResult.path, { root: '.' });
                }
            }
            catch (err) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
            }
        };
        // --- Add this method for robust cache-enabled image streaming ---
        this.sendImageWithCache = (req, res, filePath, cacheOptions) => {
            res.setHeader('X-Debug-Handler', 'streaming'); // DEBUG HEADER
            if (!fs_1.default.existsSync(filePath)) {
                res.status(404).json({ error: 'File not found' });
                return;
            }
            // Use setCacheHeaders to respect query parameters (no_cache, cdn, max_age)
            const responseSent = this.setCacheHeaders(req, res, cacheOptions.maxAge, cacheOptions.isCacheHit);
            if (responseSent)
                return;
            // Detect content type
            let contentType = 'image/png';
            if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
                contentType = 'image/jpeg';
            else if (filePath.endsWith('.gif'))
                contentType = 'image/gif';
            else if (filePath.endsWith('.svg'))
                contentType = 'image/svg+xml';
            res.setHeader('Content-Type', contentType);
            const stream = fs_1.default.createReadStream(filePath);
            stream.pipe(res);
        };
        this.byId = (req, res, next) => {
            const idAvatar = parseInt(req.params.id);
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            if (!startIndex || !endIndex || !idAvatar || (startIndex > endIndex)) {
                res.status(200).sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            if ((startIndex > idAvatar) || (idAvatar > endIndex)) {
                res.status(200).sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const filePath = `${process.env.UPLOAD_DIR}/id/${imageName}`;
            this.sendImageWithCache(req, res, filePath, { maxAge: 86400, isCacheHit: true });
        };
        this.byGenderBoy = (req, res, next) => {
            const startIndex = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
            const endIndex = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.status(200).sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let pathResult = null;
            if (req.query.username) {
                pathResult = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
            }
            else {
                pathResult = this.getImagePath("boy", startIndex, endIndex);
            }
            if (pathResult && pathResult.path) {
                this.sendImageWithCache(req, res, pathResult.path, { maxAge: 3600, isCacheHit: pathResult.isCacheHit });
            }
        };
        this.byGenderGirl = (req, res, next) => {
            const startIndex = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
            const endIndex = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.status(200).sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let pathResult = null;
            if (req.query.username) {
                pathResult = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
            }
            else {
                pathResult = this.getImagePath("girl", startIndex, endIndex);
            }
            if (pathResult && pathResult.path) {
                this.sendImageWithCache(req, res, pathResult.path, { maxAge: 3600, isCacheHit: pathResult.isCacheHit });
            }
        };
        //job avatrs
        this.jobsList = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];
        this.byJob = (req, res, next) => {
            const job = req.params.job;
            const gender = req.params.gender;
            if (!this.jobsList.includes(job) || !['male', 'female'].includes(gender)) {
                res.status(200).sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            const filePath = `${process.env.UPLOAD_DIR}/job/${job}/${gender}${this.foramtFile}`;
            this.sendImageWithCache(req, res, filePath, { maxAge: 86400, isCacheHit: true });
        };
        //username
        this.checkValidColor = (color) => {
            var regex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            return regex.test(color);
        };
        this.svgAvatar = (req, res, next) => {
            var _a, _b, _c, _d, _e;
            if ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.referer) {
                console.log("=> Refer:", (_b = req.headers) === null || _b === void 0 ? void 0 : _b.referer);
            }
            const defaultColorArray = [
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
            let defaultColor = defaultColorArray[Math.floor(Math.random() * 3)];
            let format = 'png';
            let username = [String.fromCharCode(Math.random() * 26 + 65), String.fromCharCode(Math.random() * 26 + 65)]; //Random
            const size = req.query.size ? (Number(req.query.size) > 32 ? (Number(req.query.size) < 1024 ? Number(req.query.size) : 1024) : 32) : 256;
            const uppercase = req.query.uppercase ? (req.query.uppercase == "false" ? false : true) : true;
            const bold = req.query.bold ? (req.query.bold == "false" ? false : true) : true;
            const length = req.query.length ? (Number(req.query.length) > 2 ? 2 : Number(req.query.length)) : 2;
            //Username
            if (req.query.username) {
                console.log("Username: ", req.query.username);
                username = req.query.username.toString().split(' ');
                if (username[0].length > 1) {
                    username.push(username[0].charAt(1));
                }
                else {
                    username.push("");
                }
                defaultColor = defaultColorArray[req.query.username.toString().length % 4];
            }
            //Background
            // @ts-ignore
            let backgroundColor = defaultColor.background;
            if (req.query.background) {
                backgroundColor = this.checkValidColor(req.query.background.toString()) ? req.query.background.toString() : backgroundColor;
            }
            //Color
            // @ts-ignore
            let fontColor = defaultColor.color;
            if (req.query.color) {
                fontColor = this.checkValidColor(req.query.color.toString()) ? req.query.color.toString() : fontColor;
            }
            //Format
            if (req.query.format) {
                format = ['png', 'jpg'].includes(req.query.format.toString()) ? req.query.format.toString() : 'png';
            }
            //Uppercase
            if (uppercase) {
                username.forEach((item, index) => {
                    username[index] = item.toUpperCase();
                });
            }
            else {
                username.forEach((item, index) => {
                    username[index] = item.toLowerCase();
                });
            }
            //length
            if (length == 1) {
                username[1] = "";
            }
            // Generate cache key
            const cacheKey = cacheService_1.default.generateSvgKey({
                username: (_c = req.query.username) === null || _c === void 0 ? void 0 : _c.toString(),
                size,
                format,
                backgroundColor,
                fontColor,
                uppercase,
                bold,
                length
            });
            // Check cache first
            const cachedBuffer = cacheService_1.default.getSvgAvatar(cacheKey);
            if (cachedBuffer) {
                res.set('Content-Type', `image/${format}`);
                // Set cache headers for SVG avatars
                const responseSent = this.setCacheHeaders(req, res, 86400, true); // 24 hours default, cache hit
                if (responseSent)
                    return;
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
                <text x="50%" y="54%" fill="#${fontColor}" font-size="110" dominant-baseline="middle" text-anchor="middle">${((_d = username[0]) === null || _d === void 0 ? void 0 : _d.charAt(0)) + ((_e = username[1]) === null || _e === void 0 ? void 0 : _e.charAt(0))}</text> 
            </svg>
        `;
            // Convert SVG to Format
            svg2img(svgContent, {
                format,
                resvg: {
                    font: {
                        fontFiles: [`./static/font/${bold ? 'Roboto-Medium.ttf' : 'Roboto-Light.ttf'}`],
                        loadSystemFonts: false,
                    },
                }
            }, (error, buffer) => {
                if (error) {
                    res.status(500)
                        .sendFile(this.get404Avatar(), { root: '.' });
                }
                else {
                    // Cache the generated image
                    cacheService_1.default.setSvgAvatar(cacheKey, buffer);
                    res.set('Content-Type', `image/${format}`);
                    // Set cache headers for SVG avatars
                    const responseSent = this.setCacheHeaders(req, res, 86400, false); // 24 hours default, cache miss
                    if (responseSent)
                        return;
                    res.send(buffer);
                }
            });
        };
        // Test endpoint for cache functionality
        this.testCache = (req, res, next) => {
            // Set cache headers
            const responseSent = this.setCacheHeaders(req, res, 3600, true);
            if (responseSent)
                return;
            // Send a simple JSON response
            res.json({
                message: "Cache test endpoint",
                timestamp: new Date().toISOString(),
                cacheStatus: "HIT"
            });
        };
    }
}
exports.default = new publicController();
