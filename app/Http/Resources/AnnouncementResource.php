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
            
            'content' => $this->content,
            
            // 👇 formatted for display
            'event_date' => $this->event_date
                ? $this->event_date->format('M d, Y')
                : $this->created_at->format('M d, Y'),

            // 👇 raw date for forms
            'raw_date' => $this->event_date?->format('Y-m-d'),
            
        ];
            // Only send full content if we aren't on the list page (saves bandwidth)
        //'content'    => $this->when($request->routeIs('announcements.view'), $this->content),
    }
}
