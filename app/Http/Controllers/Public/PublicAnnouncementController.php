<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Http\Resources\AnnouncementResource;
use Inertia\Inertia;

class PublicAnnouncementController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Announcements/Index', [
            'announcements' => AnnouncementResource::collection(Announcement::latest()->get())
        ]);
    }

    public function show(Announcement $announcement)
    {
        return Inertia::render('Public/Announcements/Show', [
            'announcement' => new AnnouncementResource($announcement)
        ]);
    }
}
