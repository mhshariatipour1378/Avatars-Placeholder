"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
//public
const public_1 = __importDefault(require("./public"));
router.use('/public', public_1.default);
//username
const username_1 = __importDefault(require("./username"));
router.use('/username', username_1.default);
//api
const api_1 = __importDefault(require("./api"));
router.use('/api', api_1.default);
// Cache statistics endpoint
router.get('/cache/stats', (req, res) => {
    try {
        const cacheService = require('../services/cacheService').default;
        const stats = cacheService.getStats();
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({
            cache: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get cache statistics',
            message: error.message
        });
    }
});
// Performance metrics endpoint
router.get('/performance/metrics', (req, res) => {
    try {
        const performanceMiddleware = require('../middleware/performanceMiddleware').default;
        const metrics = performanceMiddleware.getMetrics();
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({
            performance: metrics,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get performance metrics',
            message: error.message
        });
    }
});
// Clear cache endpoint (for admin use)
router.post('/cache/clear', (req, res) => {
    try {
        const cacheService = require('../services/cacheService').default;
        cacheService.clearAll();
        res.status(200).json({
            message: 'Cache cleared successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});
// Reset performance metrics endpoint
router.post('/performance/reset', (req, res) => {
    try {
        const performanceMiddleware = require('../middleware/performanceMiddleware').default;
        performanceMiddleware.resetMetrics();
        res.status(200).json({
            message: 'Performance metrics reset successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to reset performance metrics',
            message: error.message
        });
    }
});
exports.default = router;
