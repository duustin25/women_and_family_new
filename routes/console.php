<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule daily automated database backups at midnight (00:00) with 30-day retention pruning
Schedule::command('db:backup')->dailyAt('00:00');

// Schedule daily automated 14-day SLA auto-approval for neglected organization applications
Schedule::command('orgs:auto-approve')->dailyAt('01:00');
