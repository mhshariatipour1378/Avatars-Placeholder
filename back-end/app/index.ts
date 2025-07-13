import express, { Application as ExpressApp, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import router from './routes';
import performanceMiddleware from './middleware/performanceMiddleware';

export default class Application {
    public app: ExpressApp;

    constructor() {
        this.app = express();
        this.registerHealthEndpoint();
        this.config();
        this.setRoutes();
    }

    private registerHealthEndpoint() {
        this.app.get('/health', (req: Request, res: Response) => {
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

    private config() {
        // Performance monitoring middleware
        this.app.use(performanceMiddleware.trackPerformance);

        // Enable compression for all responses
        this.app.use(compression({
            level: 6, // Balanced compression level
            threshold: 1024, // Only compress responses larger than 1KB
            filter: (req: any, res: any) => {
                // Don't compress images that are already compressed
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression.filter(req, res);
            }
        }));

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());

        // Add security headers
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            if (
                req.path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/) &&
                !req.path.startsWith('/avatar/')
            ) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('ETag', `"${Date.now()}"`);
            }
            next();
        });
    }

    private setRoutes() {
        this.app.use(router);

        // Catch-all 404 route (must be last)
        this.app.all('*', (req: Request, res: Response) => {
            // Dynamically import to avoid circular dependency
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const publicController = require('./http/controller/publicController').default;
            res.status(200).sendFile(publicController.get404Avatar(), { root: '.' });
        });
    }

    public start() {
        const port = process.env.PORT || 3000;
        this.app.listen(port, (err?: Error) => {
            if (err) console.log(err);
            console.log(`server run on port ${port} ....`);
            if (process.env.MODE === 'dev') console.log('Development mode is enabled :)');
        });
    }
}