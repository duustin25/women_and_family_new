<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Http\Resources\AnnouncementResource; // Import the Resource
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

use App\Models\Member;
use App\Mail\AnnouncementBroadcast;
use App\Jobs\SendBulkAnnouncementEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        // Eager load author and organization
        $query = Announcement::with(['user', 'organization'])->latest();

        // Search Filter
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('category', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('location', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('excerpt', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Category Filter
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Paginated results
        $announcement = $query->paginate(10)->withQueryString();

        // Key metrics for the signature KPI ribbon
        $stats = [
            'total'            => Announcement::count(),
            'upcoming_events'  => Announcement::whereNotNull('event_date')->where('event_date', '>=', now()->toDateString())->count(),
            'total_events'     => Announcement::whereNotNull('event_date')->count(),
            'categories_count' => Announcement::distinct('category')->count('category'),
            'this_month'       => Announcement::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
        ];

        $categories = Announcement::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => AnnouncementResource::collection($announcement),
            'filters'       => $request->only(['search', 'category']),
            'stats'         => $stats,
            'categories'    => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $rules = [
            'title'      => 'required|string|max:255',
            'category'   => 'required|string',
            'content'    => 'required',
            'excerpt'    => 'required|max:150',
            'event_date' => 'nullable|date',
            'location'   => 'nullable|string',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|mimes:jpg,jpeg,png|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('admin/announcements', 'public');
        } else {
            $validated['image_path'] = null;
        }
        unset($validated['image']);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $validated['user_id'] = $user->id;
        $validated['organization_id'] = $user->organization_id;

        // Create the announcement
        $announcement = Announcement::create($validated);

        // BROADCAST ENGINE: Dispatch background job to broadcast announcement
        SendBulkAnnouncementEmail::dispatch($announcement, Auth::id());

        return redirect()->route('admin.announcements.index')->with('message', 'Announcement Published. The announcement broadcast has been queued in the background.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            // Use the single Resource for the edit form
            'announcement' => new AnnouncementResource($announcement)
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $rules = [
            'title'      => 'required|string|max:255',
            'category'   => 'required|string',
            'content'    => 'required',
            'excerpt'    => 'required|max:150',
            'event_date' => 'nullable|date',
            'location'   => 'nullable|string',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            if ($announcement->image_path) {
                Storage::disk('public')->delete($announcement->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('announcements', 'public');
        }
        unset($validated['image']);

        // We update everything except the ID
        $announcement->update($validated);
        return redirect()->route('admin.announcements.index')->with('success', 'Announcement Updated!');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->image_path) {
            Storage::disk('public')->delete($announcement->image_path);
        }

        $announcement->delete();
        return redirect()->route('admin.announcements.index')->with('success', 'Post deleted.');
    }
}
