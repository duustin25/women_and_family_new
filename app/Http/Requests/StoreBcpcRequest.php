<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBcpcRequest extends FormRequest
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
            'victim_name' => 'nullable|string',
            'victim_age' => 'nullable|numeric',
            'victim_gender' => 'nullable|string',
            'concern_type' => 'required|string', // Abuse, Abandonment, CICL
            'location' => 'required|string',
            'description' => 'required|string',
            'informant_name' => 'nullable|string',
            'informant_contact' => 'nullable|string',
            'status' => 'nullable|string',
        ];
    }
}
