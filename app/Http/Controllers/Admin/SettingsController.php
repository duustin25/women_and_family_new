<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CaseAbuseType;
use App\Models\Zone;
use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationalMember;
use App\Models\AuditLog;
use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Closure;

class SettingsController extends Controller implements HasMiddleware
{
    protected DatabaseBackupService $backupService;

    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware(function (Request $request, Closure $next) {
                if (!$request->user() || !$request->user()->isAdmin()) {
                    abort(403, 'Unauthorized. System Settings is restricted to Administrators.');
                }
                return $next($request);
            }),
        ];
    }

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'taxonomies');

        $data = [
            'currentTab' => $activeTab,
            'abuseTypes' => [],
            'zones' => [],
            'referralPartners' => [],
            'caseStatuses' => [],
            'users' => null,
            'userFilters' => [],
            'organizations' => [],
            'officials' => [],
            'availableUsers' => [],
            'backups' => [],
            'logs' => null,
            'logFilters' => [],
            'chatbotEnabled' => (bool) session('chatbot_enabled', true),
        ];

        // 1. Taxonomies
        if ($activeTab === 'taxonomies') {
            $data['abuseTypes'] = CaseAbuseType::where('category', 'VAWC')
                ->orderBy('name')
                ->get();
            $data['zones'] = Zone::orderBy('name')->get();
        }

        // 2. Users Tab
        if ($activeTab === 'users') {
            $query = User::with('organization')->latest();
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }
            if ($request->filled('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }
            $data['users'] = $query->paginate(10)->withQueryString();
            $data['userFilters'] = $request->only(['search', 'role']);
            $data['organizations'] = Organization::select('id', 'name')->orderBy('name')->get();
        }

        // 3. Officials Tab
        if ($activeTab === 'officials') {
            $data['officials'] = OrganizationalMember::with('user')
                ->orderBy('level')
                ->orderBy('display_order')
                ->get();
            $data['availableUsers'] = User::select('id', 'name')->get();
        }

        // 4. Features Tab
        if ($activeTab === 'features') {
            $data['chatbotEnabled'] = (bool) session('chatbot_enabled', true);
        }

        // 5. Backup Tab
        if ($activeTab === 'backup') {
            $data['backups'] = $this->backupService->getBackups();
        }

        // 6. Audit Tab
        if ($activeTab === 'audit') {
            $query = AuditLog::with(['user:id,name,role', 'auditable'])->latest();
            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('auditable_type', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            }
            if ($request->filled('date_start')) {
                $query->whereDate('created_at', '>=', $request->date_start);
            }
            if ($request->filled('date_end')) {
                $query->whereDate('created_at', '<=', $request->date_end);
            }
            $data['logs'] = $query->paginate(15)->withQueryString();
            $data['logFilters'] = $request->only(['action', 'user_id', 'search', 'date_start', 'date_end']);
        }

        return Inertia::render('Admin/Settings/Index', $data);
    }

    public function storeAbuseType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:case_types,name',
            'category' => 'required|string|in:VAWC',
            'color' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        CaseAbuseType::create($validated);

        return back()->with('success', 'Abuse Type added successfully.');
    }

    public function updateAbuseType(Request $request, int $id)
    {
        $type = CaseAbuseType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:case_types,name,' . $id,
            'category' => 'sometimes|required|string|in:VAWC',
            'color' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $type->update($validated);

        return back()->with('success', 'Abuse Type updated.');
    }



    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:zones,name',
        ]);

        Zone::create($validated);

        return back()->with('success', 'Zone added successfully.');
    }

    public function updateZone(Request $request, int $id)
    {
        $zone = Zone::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:zones,name,' . $id,
            'is_active' => 'boolean'
        ]);

        $zone->update($validated);

        return back()->with('success', 'Zone updated.');
    }

    public function updateFeatureToggle(Request $request)
    {
        $validated = $request->validate([
            'feature' => 'required|string|in:chatbot_enabled',
            'enabled' => 'required|boolean',
        ]);

        if ($validated['feature'] === 'chatbot_enabled') {
            session(['chatbot_enabled' => (bool)$validated['enabled']]);
        }

        return back()->with('success', 'System feature toggle updated successfully.');
    }
}
