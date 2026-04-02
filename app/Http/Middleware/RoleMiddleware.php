<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            abort(403, 'Unauthorized');
        }

        // Super Admin Bypass (optional, but good for safety)
        if ($request->user()->role === \App\Models\User::ROLE_ADMIN) {
            return $next($request);
        }

        // Check if user has one of the allowed roles
        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        // --- ACCOUNTABILITY: Log Unauthorized Access Attempt ---
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'UNAUTHORIZED_ACCESS_ATTEMPT',
            'auditable_type' => 'Route',
            'auditable_id' => 0,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'new_values' => [
                'path' => $request->path(),
                'method' => $request->method(),
                'required_roles' => $roles
            ]
        ]);

        abort(403, 'Unauthorized. Access Denied.');
    }
}
