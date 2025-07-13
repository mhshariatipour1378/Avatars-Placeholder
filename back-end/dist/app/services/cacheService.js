"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lru_cache_1 = require("lru-cache");
class CacheService {
    constructor() {
        // Cache for SVG-generated images (most expensive operation)
        this.svgCache = new lru_cache_1.LRUCache({
            max: 1000, // Store up to 1000 SVG images
            ttl: 1000 * 60 * 60 * 24, // 24 hours
            updateAgeOnGet: true,
            allowStale: true,
        });
        // Cache for file paths (frequently accessed)
        this.pathCache = new lru_cache_1.LRUCache({
            max: 5000, // Store up to 5000 paths
            ttl: 1000 * 60 * 60, // 1 hour
            updateAgeOnGet: true,
        });
        // Cache for configuration data
        this.configCache = new lru_cache_1.LRUCache({
            max: 100, // Store up to 100 config items
            ttl: 1000 * 60 * 30, // 30 minutes
            updateAgeOnGet: true,
        });
    }
    // SVG Avatar caching
    getSvgAvatar(key) {
        return this.svgCache.get(key);
    }
    setSvgAvatar(key, buffer) {
        this.svgCache.set(key, buffer);
    }
    // Path caching
    getPath(key) {
        return this.pathCache.get(key);
    }
    setPath(key, path) {
        this.pathCache.set(key, path);
    }
    // Configuration caching
    getConfig(key) {
        return this.configCache.get(key);
    }
    setConfig(key, value) {
        this.configCache.set(key, value);
    }
    // Generate cache key for SVG avatars
    generateSvgKey(params) {
        return `svg:${params.username || 'random'}:${params.size}:${params.format}:${params.backgroundColor}:${params.fontColor}:${params.uppercase}:${params.bold}:${params.length}`;
    }
    // Generate cache key for file paths
    generatePathKey(folderName, startIndex, endIndex, username) {
        return `path:${folderName}:${startIndex}:${endIndex}:${username || 'random'}`;
    }
    // Clear all caches
    clearAll() {
        this.svgCache.clear();
        this.pathCache.clear();
        this.configCache.clear();
    }
    // Get cache statistics
    getStats() {
        return {
            svg: { size: this.svgCache.size, max: this.svgCache.max },
            path: { size: this.pathCache.size, max: this.pathCache.max },
            config: { size: this.configCache.size, max: this.configCache.max },
        };
    }
}
exports.default = new CacheService();
