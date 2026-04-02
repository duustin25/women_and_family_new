<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GadEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class OrganizationEventController extends Controller
{
    /**
     * Display a listing of the organization's own proposals.
     */
    public function index(Request $request)
    {
        $organization_id = Auth::user()->organization_id;

        $query = GadEvent::where('organization_id', $organization_id);

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $events = $query->orderBy('event_date', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Organization/Events/Index', [
            'events'  => $events,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    /**
     * Submit a new event proposal.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'event_date'  => 'required|date',
            'event_time'  => 'required',
            'location'    => 'required|string|max:255',
            'image_path'  => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            $path = $request->file('image_path')->store('gad_events', 'public');
            $validated['image_path'] = $path;
        }

        // Force the owner and set initial status
        $validated['organization_id'] = Auth::user()->organization_id;
        $validated['status']          = 'pending';

        $event = GadEvent::create($validated);

        // Broadcast the new proposal event so admins get notified
        event(new \App\Events\GadEventProposed($event));

        return redirect()->back()->with('success', 'Event proposed successfully. Awaiting Admin approval.');
    }

    /**
     * Update / resubmit an existing event proposal.
     */
    public function update(Request $request, string $id)
    {
        $event = GadEvent::where('organization_id', Auth::user()->organization_id)
                         ->findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'event_date'  => 'required|date',
            'event_time'  => 'required',
            'location'    => 'required|string|max:255',
            'image_path'  => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image_path')) {
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }
            $path = $request->file('image_path')->store('gad_events', 'public');
            $validated['image_path'] = $path;
        }

        // Resubmitting a rescheduled event resets it back to pending
        if ($event->status === 'reschedule_requested') {
            $validated['status']        = 'pending';
            $validated['reject_reason'] = null;
        }

        $event->update($validated);

        return redirect()->back()->with('success', 'Proposal updated and resubmitted for approval.');
    }

    /**
     * Delete a proposal.
     */
    public function destroy(string $id)
    {
        $event = GadEvent::where('organization_id', Auth::user()->organization_id)
                         ->findOrFail($id);

        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }

        $event->delete();

        return redirect()->back()->with('success', 'Proposal deleted successfully.');
    }
}
