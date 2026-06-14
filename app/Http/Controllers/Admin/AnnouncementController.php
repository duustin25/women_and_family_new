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
        // Start a basic query
        $query = Announcement::query()->latest();

        // Simple Filter Logic
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('title', 'LIKE', "%{$searchTerm}%")
                ->orWhere('category', 'LIKE', "%{$searchTerm}%");
        }

        // Get the result
        $announcement = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => AnnouncementResource::collection($announcement),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'content' => 'required',
            'excerpt' => 'required|max:150',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string'
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('admin/announcements', 'public');
        }

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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'content' => 'required',
            'excerpt' => 'required|max:150',
            'image' => 'nullable|image|max:2048',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string'
        ]);

        if ($request->hasFile('image')) {
            if ($announcement->image_path) {
                Storage::disk('public')->delete($announcement->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('announcements', 'public');
        }

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
