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

        // BROADCAST ENGINE: Automated Organizational Messaging Hub
        // Logic: Targeted broadcast if organization_id exists, Global broadcast if NULL (Admin)
        $memberQuery = Member::where('status', 'Active')->whereNotNull('email');

        if ($announcement->organization_id) {
            $memberQuery->where('organization_id', $announcement->organization_id);
        }

        // Prevent timeout during bulk email dispatch
        set_time_limit(120); // 2 minutes execution limit

        $members = $memberQuery->get();
        $dispatchedCount = 0;

        // TRY AND CATCH CODE, to prevent sending email timeout
        foreach ($members as $member) {
            try {
                // Dispatching email notification
                Mail::to($member->email)->send(new AnnouncementBroadcast($announcement));

                // Audit Trail: Log every communication in the hub
                \App\Models\MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by' => Auth::id(),
                    'subject' => ($announcement->organization_id ? 'Organization Update: ' : 'Brgy. 183 Official Announcement: ') . $announcement->title,
                    'body' => $announcement->excerpt,
                    'type' => 'Bulk',
                    'status' => 'Sent'
                ]);

                $dispatchedCount++;
            } catch (\Exception $e) {
                // Log the failure to prevent crashing the entire broadcast process
                \Illuminate\Support\Facades\Log::error("Failed to broadcast announcement to member {$member->id}: " . $e->getMessage());

                // Log as 'Failed' in the audit trail
                \App\Models\MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by' => Auth::id(),
                    'subject' => ($announcement->organization_id ? 'Organization Update: ' : 'Brgy. 183 Official Announcement: ') . $announcement->title,
                    'body' => $announcement->excerpt,
                    'type' => 'Bulk',
                    'status' => 'Failed'
                ]);
            }
        }

        return redirect()->route('admin.announcements.index')->with('message', 'Announcement Published. Dispatched successfully to ' . $dispatchedCount . ' out of ' . $members->count() . ' members via Secure Messaging Hub.');
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
