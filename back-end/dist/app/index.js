"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const routes_1 = __importDefault(require("./routes"));
const performanceMiddleware_1 = __importDefault(require("./middleware/performanceMiddleware"));
class Application {
    constructor() {
        this.app = (0, express_1.default)();
        this.registerHealthEndpoint();
        this.config();
        this.setRoutes();
    }
    registerHealthEndpoint() {
        this.app.get('/health', (req, res) => {
            console.log('Health endpoint hit - DEBUG-12345');
            res.setHeader('X-Debug-Health', 'DEBUG-12345');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                memory: process.memoryUsage(),
                version: process.version
            });
        });
    }
    config() {
        // Performance monitoring middleware
        this.app.use(performanceMiddleware_1.default.trackPerformance);
        // Enable compression for all responses
        this.app.use((0, compression_1.default)({
            level: 6, // Balanced compression level
            threshold: 1024, // Only compress responses larger than 1KB
            filter: (req, res) => {
                // Don't compress images that are already compressed
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression_1.default.filter(req, res);
            }
        }));
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
        // Add security headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            if (req.path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/) &&
                !req.path.startsWith('/avatar/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('ETag', `"${Date.now()}"`);
            }
            next();
        });
    }
    setRoutes() {
        this.app.use(routes_1.default);
        // Catch-all 404 route (must be last)
        this.app.all('*', (req, res) => {
            // Dynamically import to avoid circular dependency
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const publicController = require('./http/controller/publicController').default;
            res.status(200).sendFile(publicController.get404Avatar(), { root: '.' });
        });
    }
    start() {
        const port = process.env.PORT || 3000;
        this.app.listen(port, (err) => {
            if (err)
                console.log(err);
            console.log(`server run on port ${port} ....`);
            if (process.env.MODE === 'dev')
                console.log('Development mode is enabled :)');
        });
    }
}
exports.default = Application;
