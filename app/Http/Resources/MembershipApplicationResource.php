<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'organization_name' => $this->organization->name ?? 'N/A',
            'organization_color' => $this->organization->color_theme ?? '#000000',

            // Primary Identity
            'fullname' => $this->fullname,
            'address' => $this->address,
            'email' => $this->email,
            'status' => $this->status,

            // Dynamic Form Submission (New Unified Mapping)
            'form_data' => $this->form_data ?? [],

            // Approval Info
            'recommended_by' => $this->recommended_by,
            'approved_by' => $this->approved_by,
            'actioned_at' => $this->actioned_at ? $this->actioned_at->format('M d, Y h:i A') : null,

            'created_at' => $this->created_at->format('M d, Y'),
        ];
    }
}
