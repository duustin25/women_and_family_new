<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GadEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class GadEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = GadEvent::query()->with('organization');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $events = $query->orderBy('event_date', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/GadEvents/Index', [
            'events' => $events,
            'filters' => $request->only('search', 'status')
        ]);
    }

    /**
     * Store a newly created resource in storage (Admin-created → auto-approved).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'description'=> 'required|string',
            'event_date' => 'required|date',
            'event_time' => 'required',
            'location'   => 'required|string|max:255',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $path = $request->file('image_path')->store('gad_events', 'public');
            $validated['image_path'] = $path;
        }

        // Admin-created events are immediately approved & visible on the public calendar
        $validated['status'] = 'approved';

        GadEvent::create($validated);

        return redirect()->route('admin.gad.events.index')->with('success', 'Event created and published successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $event = GadEvent::findOrFail($id);

        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'description'=> 'required|string',
            'event_date' => 'required|date',
            'event_time' => 'required',
            'location'   => 'required|string|max:255',
            'image_path' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }
            $path = $request->file('image_path')->store('gad_events', 'public');
            $validated['image_path'] = $path;
        }

        $event->update($validated);

        return redirect()->route('admin.gad.events.index')->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $event = GadEvent::findOrFail($id);

        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }

        $event->delete();

        return redirect()->route('admin.gad.events.index')->with('success', 'Event deleted successfully.');
    }

    /**
     * Update the approval status of a proposed event.
     */
    public function updateStatus(Request $request, string $id)
    {
        $event = GadEvent::findOrFail($id);

        $validated = $request->validate([
            'status'        => 'required|in:approved,rejected,reschedule_requested',
            'reject_reason' => 'required_if:status,rejected,reschedule_requested|nullable|string',
        ]);

        $event->update([
            'status'        => $validated['status'],
            'reject_reason' => $validated['reject_reason'] ?? null,
        ]);

        $message = match ($validated['status']) {
            'approved'              => 'Event approved and published to the Global Public Calendar.',
            'reschedule_requested'  => 'Reschedule request sent to the organization.',
            default                 => 'Event rejected.',
        };

        // BROADCAST ENGINE: Automated Organizational Messaging Hub
        // If approved, notify the organization members
        if ($validated['status'] === 'approved') {
            $memberQuery = \App\Models\Member::where('status', 'Active')->whereNotNull('email');

            // If it's an organization-specific event, target their members
            if ($event->organization_id) {
                $memberQuery->where('organization_id', $event->organization_id);
            }

            $members = $memberQuery->get();

            foreach ($members as $member) {
                \Illuminate\Support\Facades\Mail::to($member->email)->send(new \App\Mail\EventInvitation($event));

                // Audit Trail
                \App\Models\MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by' => \Illuminate\Support\Facades\Auth::id(),
                    'subject' => 'Official Event Invitation: ' . $event->title,
                    'body' => $event->description,
                    'type' => 'Bulk',
                    'status' => 'Sent'
                ]);
            }

            $message = 'Event approved and dispatched to ' . $members->count() . ' members via Messaging Hub.';
        }

        return redirect()->back()->with('success', $message);
    }
}
