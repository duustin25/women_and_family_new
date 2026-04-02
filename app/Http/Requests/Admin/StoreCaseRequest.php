<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|string|in:VAWC,BCPC',
            'victim_name' => 'nullable|string|max:255',
            'victim_age' => 'nullable|string|max:50',
            'victim_gender' => 'nullable|string|max:50',
            'complainant_name' => 'nullable|string|max:255',
            'complainant_contact' => 'nullable|string|max:100',
            'relation_to_victim' => 'nullable|string|max:255',
            'incident_date' => 'nullable|date',
            'incident_location' => 'required|string|max:500',
            'description' => 'required|string',
            'abuse_type' => 'required|string|max:255',
            'is_anonymous' => 'nullable|boolean',
            'zone_id' => 'nullable|exists:zones,id',
        ];
    }
}
