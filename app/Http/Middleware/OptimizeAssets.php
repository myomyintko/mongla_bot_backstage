<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptimizeAssets
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add performance headers for static assets
        if ($this->isStaticAsset($request)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        }

        // Add compression headers
        if ($this->shouldCompress($request)) {
            $response->headers->set('Vary', 'Accept-Encoding');
        }

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        return $response;
    }

    /**
     * Check if the request is for a static asset
     */
    private function isStaticAsset(Request $request): bool
    {
        $path = $request->getPathInfo();
        $extensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'];

        foreach ($extensions as $extension) {
            if (str_ends_with($path, '.' . $extension)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the response should be compressed
     */
    private function shouldCompress(Request $request): bool
    {
        $acceptEncoding = $request->headers->get('Accept-Encoding', '');
        return str_contains($acceptEncoding, 'gzip') || str_contains($acceptEncoding, 'deflate');
    }
}
