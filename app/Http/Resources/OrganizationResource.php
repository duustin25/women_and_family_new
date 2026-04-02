<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'president_name' => $this->president ? $this->president->name : null,
            'color_theme' => $this->color_theme ?? 'bg-blue-700',

            // Image URL from your Model Accessor
            'image' => $this->image_path ? asset('storage/' . $this->image_path) : null,
            'left_logo' => $this->left_logo_path ? asset('storage/' . $this->left_logo_path) : null,
            'right_logo' => $this->right_logo_path ? asset('storage/' . $this->right_logo_path) : null,

            // Handle the JSON Requirements (Hazel's Suggestion)
            // Ensure it's always an array even if empty
            'requirements' => $this->requirements ?? [],

            // Dynamic Form Schema (JSON)
            'form_schema' => $this->form_schema ?? [],

            'created_at' => $this->created_at->format('M d, Y'),
        ];
    }
}
