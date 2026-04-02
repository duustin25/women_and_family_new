<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Organization;
use App\Models\MemberCommunication;
use App\Models\BeneficiaryDispatch;
use App\Mail\GeneralMessage;
use App\Mail\MembershipApproved;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MembersController extends Controller
{
    /**
     * Display a filtered list of all approved members.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = Member::with(['organization', 'communications', 'dispatches'])->latest();

        // RBAC: President sees only their organization's members
        if ($user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('organization_id') && $request->organization_id !== 'all') {
            $query->where('organization_id', $request->organization_id);
        }

        $members = $query->paginate(15)->withQueryString();
        $organizations = Organization::orderBy('name')->get();

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'organization_id'])
        ]);
    }

    /**
     * Send an individual email to a specific member.
     */
    public function sendIndividualEmail(Request $request, Member $member)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        // RBAC: President can only message their own organization's members
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $member->organization_id) {
            abort(403, 'Unauthorized. Access Denied.');
        }

        if (!$member->email) {
            return back()->with('error', 'Member does not have a recorded email address.');
        }

        // Send Professional Email
        Mail::to($member->email)->send(new GeneralMessage($validated['subject'], $validated['body']));

        // Log the communication
        MemberCommunication::create([
            'member_id' => $member->id,
            'sent_by' => Auth::id(),
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'type' => 'Individual',
            'status' => 'Sent'
        ]);

        return back()->with('success', 'Message sent successfully to ' . $member->fullname);
    }

    /**
     * Send bulk emails to a group of members.
     */
    public function sendBulkEmail(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'recipient_group' => 'required|string' // 'all', 'solo_parents', etc.
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = Member::query();

        // RBAC: President only messages their members
        if ($user->isPresident()) {
            $query->where('organization_id', $user->organization_id);
        }

        // Further filtering based on group (implementation depends on member attributes)
        // For now, we'll support 'all'
        $members = $query->whereNotNull('email')->get();

        foreach ($members as $member) {
            // Ideally, this should be a queued job to prevent timeout
            Mail::to($member->email)->send(new GeneralMessage($validated['subject'], $validated['body']));

            MemberCommunication::create([
                'member_id' => $member->id,
                'sent_by' => Auth::id(),
                'subject' => $validated['subject'],
                'body' => $validated['body'],
                'type' => 'Bulk',
                'status' => 'Sent'
            ]);
        }

        return back()->with('success', 'Bulk message dispatched successfully to ' . $members->count() . ' members.');
    }

    /**
     * Tag a member for a benefit and generate a reference number.
     */
    public function tagBeneficiary(Request $request, Member $member)
    {
        // RBAC: President check
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $member->organization_id) {
            abort(403, 'Unauthorized to tag this member.');
        }

        $validated = $request->validate([
            'benefit_name' => 'required|string|max:255',
            'instructions' => 'nullable|string',
        ]);

        $referenceNumber = 'BRGY-' . strtoupper(Str::random(10));

        $dispatch = BeneficiaryDispatch::create([
            'member_id' => $member->id,
            'benefit_name' => $validated['benefit_name'],
            'reference_number' => $referenceNumber,
            'status' => 'Pending'
        ]);

        // Official Branding via Mailable
        if ($member->email) {
            $subject = 'Benefit Notification: ' . $validated['benefit_name'];
            $instructions = $validated['instructions'] ?? 'Present this Reference ID at the Barangay Hall.';
            
            Mail::to($member->email)->send(new \App\Mail\BeneficiaryDispatchMail($member, $dispatch, $instructions));

            MemberCommunication::create([
                'member_id' => $member->id,
                'sent_by' => Auth::id(),
                'subject' => $subject,
                'body' => "Benefit Tagged: {$validated['benefit_name']}. Ref: {$referenceNumber}",
                'type' => 'Beneficiary',
                'status' => 'Sent'
            ]);
        }

        return back()->with('success', 'Member has been tagged for benefit. Reference: ' . $referenceNumber);
    }
}
