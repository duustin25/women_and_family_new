<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'title'    => $this->title,
            'slug'     => $this->slug,
            'category' => $this->category,
            'excerpt'  => $this->excerpt,
            'location' => $this->location,
            'date'     => $this->event_date?->format('M d, Y') ?? $this->created_at->format('M d, Y'),
            'image'    => $this->image_url, // From Model Accessor
            'content'  => $this->content,
            
            // Event Date details
            'event_date' => $this->event_date ? $this->event_date->format('M d, Y') : null,
            'raw_date'   => $this->event_date?->format('Y-m-d'),
            'is_upcoming' => $this->event_date ? $this->event_date->isFuture() || $this->event_date->isToday() : false,

            // Author and Organization details
            'author' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role ?? 'Admin',
            ] : null,
            'organization' => $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
            ] : null,

            // Publishing Timestamps
            'created_at' => $this->created_at?->format('M d, Y'),
            'created_at_human' => $this->created_at?->diffForHumans(),
        ];
    }
}
