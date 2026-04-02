<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Http\Resources\OrganizationResource;
use Inertia\Inertia;

class PublicOrganizationController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Organizations/Index', [
            'organizations' => OrganizationResource::collection(Organization::with('president')->latest()->get())
        ]);
    }

    public function show(Organization $organization)
    {
        $organization->load('president');

        return Inertia::render('Public/Organizations/Show', [
            'organization' => new OrganizationResource($organization)
        ]);
    }
}
