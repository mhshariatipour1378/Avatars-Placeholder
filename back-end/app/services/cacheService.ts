import { LRUCache } from 'lru-cache';

interface CacheOptions {
    max: number;
    ttl: number;
}

class CacheService {
    private svgCache: LRUCache<string, Buffer>;
    private pathCache: LRUCache<string, string>;
    private configCache: LRUCache<string, any>;

    constructor() {
        // Cache for SVG-generated images (most expensive operation)
        this.svgCache = new LRUCache<string, Buffer>({
            max: 1000, // Store up to 1000 SVG images
            ttl: 1000 * 60 * 60 * 24, // 24 hours
            updateAgeOnGet: true,
            allowStale: true,
        });

        // Cache for file paths (frequently accessed)
        this.pathCache = new LRUCache<string, string>({
            max: 5000, // Store up to 5000 paths
            ttl: 1000 * 60 * 60, // 1 hour
            updateAgeOnGet: true,
        });

        // Cache for configuration data
        this.configCache = new LRUCache<string, any>({
            max: 100, // Store up to 100 config items
            ttl: 1000 * 60 * 30, // 30 minutes
            updateAgeOnGet: true,
        });
    }

    // SVG Avatar caching
    getSvgAvatar(key: string): Buffer | undefined {
        return this.svgCache.get(key);
    }

    setSvgAvatar(key: string, buffer: Buffer): void {
        this.svgCache.set(key, buffer);
    }

    // Path caching
    getPath(key: string): string | undefined {
        return this.pathCache.get(key);
    }

    setPath(key: string, path: string): void {
        this.pathCache.set(key, path);
    }

    // Configuration caching
    getConfig(key: string): any {
        return this.configCache.get(key);
    }

    setConfig(key: string, value: any): void {
        this.configCache.set(key, value);
    }

    // Generate cache key for SVG avatars
    generateSvgKey(params: {
        username?: string;
        size: number;
        format: string;
        backgroundColor: string;
        fontColor: string;
        uppercase: boolean;
        bold: boolean;
        length: number;
    }): string {
        return `svg:${params.username || 'random'}:${params.size}:${params.format}:${params.backgroundColor}:${params.fontColor}:${params.uppercase}:${params.bold}:${params.length}`;
    }

    // Generate cache key for file paths
    generatePathKey(folderName: string, startIndex: number, endIndex: number, username?: string): string {
        return `path:${folderName}:${startIndex}:${endIndex}:${username || 'random'}`;
    }

    // Clear all caches
    clearAll(): void {
        this.svgCache.clear();
        this.pathCache.clear();
        this.configCache.clear();
    }

    // Get cache statistics
    getStats(): {
        svg: { size: number; max: number };
        path: { size: number; max: number };
        config: { size: number; max: number };
    } {
        return {
            svg: { size: this.svgCache.size, max: this.svgCache.max },
            path: { size: this.pathCache.size, max: this.pathCache.max },
            config: { size: this.configCache.size, max: this.configCache.max },
        };
    }
}

export default new CacheService(); 