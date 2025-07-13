const express = require('express')
import {Request, Response, NextFunction } from 'express';
const router = express.Router()

//controller
import publicController from "./../http/controller/publicController";

//public
import Public from "./public"
router.use('/public', Public)

//username
import Username from "./username"
router.use('/username', Username)

//api
import Api from "./api"
router.use('/api', Api)

// Cache statistics endpoint
router.get('/cache/stats', (req: Request, res: Response) => {
    try {
        const cacheService = require('../services/cacheService').default;
        const stats = cacheService.getStats();
        
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({
            cache: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to get cache statistics',
            message: error.message
        });
    }
});

// Performance metrics endpoint
router.get('/performance/metrics', (req: Request, res: Response) => {
    try {
        const performanceMiddleware = require('../middleware/performanceMiddleware').default;
        const metrics = performanceMiddleware.getMetrics();
        
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({
            performance: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to get performance metrics',
            message: error.message
        });
    }
});

// Clear cache endpoint (for admin use)
router.post('/cache/clear', (req: Request, res: Response) => {
    try {
        const cacheService = require('../services/cacheService').default;
        cacheService.clearAll();
        
        res.status(200).json({
            message: 'Cache cleared successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});

// Reset performance metrics endpoint
router.post('/performance/reset', (req: Request, res: Response) => {
    try {
        const performanceMiddleware = require('../middleware/performanceMiddleware').default;
        performanceMiddleware.resetMetrics();
        
        res.status(200).json({
            message: 'Performance metrics reset successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Failed to reset performance metrics',
            message: error.message
        });
    }
});

export default router;
  