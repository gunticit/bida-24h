<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'stripe/*',
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API rate limit (429) errors instead of HTML
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau.',
                ], 429);
            }
        });

        // Return JSON for all HTTP exceptions on API routes
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'Có lỗi xảy ra',
                ], $e->getStatusCode());
            }
        });
    })->create();
