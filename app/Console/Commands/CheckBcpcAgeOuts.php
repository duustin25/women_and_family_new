<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BcpcChild;
use App\Services\NutritionCalculatorService;
use Carbon\Carbon;

class CheckBcpcAgeOuts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bcpc:check-ageouts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically archive BCPC children who have reached 60+ months of age (DepEd School Transfer & COA Audit Archival Protocol)';

    /**
     * Execute the console command.
     */
    public function handle(NutritionCalculatorService $nutritionService): int
    {
        $this->info('Checking BCPC registry for children reaching 60+ months...');

        $activeChildren = BcpcChild::where('status', 'Active')->get();
        $archivedCount = 0;
        $today = Carbon::today()->format('Y-m-d');

        foreach ($activeChildren as $child) {
            $ageInMonths = $nutritionService->calculateAgeInMonths($child->date_of_birth->format('Y-m-d'), $today);
            if ($ageInMonths >= 60) {
                $child->update([
                    'status' => 'Aged Out'
                ]);
                $archivedCount++;
            }
        }

        $this->info("Successfully archived {$archivedCount} children who reached 60+ months (5 years old). Profile records retained for COA & DPA 2012 audit compliance.");

        return Command::SUCCESS;
    }
}
