"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PerformanceMiddleware {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageResponseTime: 0,
            responseTimes: []
        };
        this.trackPerformance = (req, res, next) => {
            const startTime = Date.now();
            // Track request
            this.metrics.totalRequests++;
            // Override res.send to track response time
            const originalSend = res.send;
            const self = this; // Capture this context
            res.send = (body) => {
                const responseTime = Date.now() - startTime;
                this.metrics.responseTimes.push(responseTime);
                // Keep only last 1000 response times for average calculation
                if (this.metrics.responseTimes.length > 1000) {
                    this.metrics.responseTimes.shift();
                }
                // Calculate average response time
                this.metrics.averageResponseTime = this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
                return originalSend.call(res, body);
            };
            // Track cache hits/misses if available
            res.on('finish', () => {
                const cacheHit = res.getHeader('X-Cache-Hit');
                if (cacheHit === 'true') {
                    this.metrics.cacheHits++;
                }
                else if (cacheHit === 'false') {
                    this.metrics.cacheMisses++;
                }
            });
            next();
        };
        this.getMetrics = () => {
            return { ...this.metrics };
        };
        this.resetMetrics = () => {
            this.metrics = {
                totalRequests: 0,
                cacheHits: 0,
                cacheMisses: 0,
                averageResponseTime: 0,
                responseTimes: []
            };
        };
    }
}
exports.default = new PerformanceMiddleware();
