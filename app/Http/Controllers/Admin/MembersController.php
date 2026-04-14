<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Organization;
use App\Models\MemberCommunication;
use App\Models\BeneficiaryDispatch;
use App\Mail\GeneralMessage;
use App\Jobs\SendBulkMemberEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
        $query = Member::with(['organization', 'application', 'communications', 'dispatches'])->latest();

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

        try {
            // Send Professional Email
            Mail::to($member->email)->send(new GeneralMessage($validated['subject'], $validated['body']));

            // Log the communication to the audit trail
            MemberCommunication::create([
                'member_id' => $member->id,
                'sent_by'   => Auth::id(),
                'subject'   => $validated['subject'],
                'body'      => $validated['body'],
                'type'      => 'Individual',
                'status'    => 'Sent',
            ]);

            return back()->with('success', 'Message sent successfully to ' . $member->fullname);

        } catch (\Throwable $e) {
            // Mail server or SMTP error — log for admin review, return friendly message
            Log::error("IndividualEmail failed for Member ID {$member->id}: " . $e->getMessage());
            return back()->with('error', 'Failed to send the message. Please check the mail configuration and try again.');
        }
    }

    /**
     * Send bulk emails to a group of members.
     */
    public function sendBulkEmail(Request $request)
    {
        $validated = $request->validate([
            'subject'          => 'required|string|max:255',
            'body'             => 'required|string',
            'recipient_group'  => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Dispatch a background job — admin gets an instant response
        SendBulkMemberEmail::dispatch(
            $validated['subject'],
            $validated['body'],
            Auth::id(),
            $user->isPresident() ? $user->organization_id : null
        );

        return back()->with('success', 'Bulk message queued and will be delivered to all eligible members shortly.');
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
        // NOTE: The benefit dispatch record is already saved above — this email is a secondary
        // notification. A mail failure must NOT roll back the tagging operation.
        if ($member->email) {
            try {
                $subject = 'Benefit Notification: ' . $validated['benefit_name'];
                $instructions = $validated['instructions'] ?? 'Present this Reference ID at the Barangay Hall.';

                Mail::to($member->email)->send(new \App\Mail\BeneficiaryDispatchMail($member, $dispatch, $instructions));

                MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by'   => Auth::id(),
                    'subject'   => $subject,
                    'body'      => "Benefit Tagged: {$validated['benefit_name']}. Ref: {$referenceNumber}",
                    'type'      => 'Beneficiary',
                    'status'    => 'Sent',
                ]);

            } catch (\Throwable $e) {
                // Email notification failed — log it, but the benefit tag was already saved successfully.
                // The admin still gets the success message with the reference number.
                Log::error("BeneficiaryDispatch email failed for Member ID {$member->id} (Ref: {$referenceNumber}): " . $e->getMessage());
            }
        }

        return back()->with('success', 'Member has been tagged for benefit. Reference: ' . $referenceNumber);
    }

    /**
     * Mark a beneficiary dispatch as claimed.
     */
    public function claimDispatch(Request $request, Member $member, BeneficiaryDispatch $dispatch)
    {
        // RBAC: President can only manage their org's members
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isPresident() && $user->organization_id !== $member->organization_id) {
            abort(403, 'Unauthorized.');
        }

        $dispatch->update([
            'status'     => 'Claimed',
            'claimed_at' => now(),
        ]);

        return back()->with('success', "Benefit '{$dispatch->benefit_name}' marked as claimed for {$member->fullname}.");
    }
}
