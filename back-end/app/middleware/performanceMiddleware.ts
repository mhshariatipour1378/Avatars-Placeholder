import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    averageResponseTime: number;
    responseTimes: number[];
}

class PerformanceMiddleware {
    private metrics: PerformanceMetrics = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageResponseTime: 0,
        responseTimes: []
    };

    trackPerformance = (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        
        // Track request
        this.metrics.totalRequests++;

        // Override res.send to track response time
        const originalSend = res.send;
        const self = this; // Capture this context
        
        res.send = (body: any) => {
            const responseTime = Date.now() - startTime;
            this.metrics.responseTimes.push(responseTime);
            
            // Keep only last 1000 response times for average calculation
            if (this.metrics.responseTimes.length > 1000) {
                this.metrics.responseTimes.shift();
            }
            
            // Calculate average response time
            this.metrics.averageResponseTime = this.metrics.responseTimes.reduce((a: number, b: number) => a + b, 0) / this.metrics.responseTimes.length;
            
            return originalSend.call(res, body);
        };

        // Track cache hits/misses if available
        res.on('finish', () => {
            const cacheHit = res.getHeader('X-Cache-Hit');
            if (cacheHit === 'true') {
                this.metrics.cacheHits++;
            } else if (cacheHit === 'false') {
                this.metrics.cacheMisses++;
            }
        });

        next();
    };

    getMetrics = (): PerformanceMetrics => {
        return { ...this.metrics };
    };

    resetMetrics = (): void => {
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageResponseTime: 0,
            responseTimes: []
        };
    };
}

export default new PerformanceMiddleware(); 