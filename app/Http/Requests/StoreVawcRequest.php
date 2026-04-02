<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVawcRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Add RBAC logic here if needed (e.g., return auth()->user()->can('create cases');)
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
            'victim_name' => 'required|string',
            'victim_age' => 'nullable|numeric',
            'complainant_name' => 'nullable|string',
            'complainant_contact' => 'nullable|string',
            'relation_to_victim' => 'nullable|string',
            'abuse_type' => 'required|string', // Physical, Sexual, etc.
            'incident_date' => 'required|date',
            'incident_location' => 'required|string',
            'description' => 'required|string',
            'status' => 'nullable|string', // Admin might set initial status
        ];
    }
}
