import {Request, Response, NextFunction} from 'express';
import generateETag from 'etag';

// ETag middleware: intercepts res.json() to automatically compute and attach ETag headers
export const etagMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Save a reference to the original res.json before overriding it
    // binding res to preserve the original 'this' content
    const originalJson = res.json.bind(res);

    res.json = (body: unknown): Response => {
        // ETag only handles GET requests
        if (req.method !== 'GET'){
            return originalJson(body)
        }

        // Serialize the response body and generate a hash-based ETag
        const bodyStr = JSON.stringify(body);
        const etag = generateETag(bodyStr);
        res.setHeader('ETag', etag);

        //no-cache: allow caching but require revalidation with the server on every request
        res.setHeader('Cache-Control', 'no-cache');

        if (req.headers['if-none-match'] === etag){
            res.status(304).end();
            return res;
        }
        return originalJson(body);
    };
    next();
};