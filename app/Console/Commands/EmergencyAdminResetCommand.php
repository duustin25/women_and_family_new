<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class EmergencyAdminResetCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:emergency-reset {--email= : The email of the admin account to recover} {--password= : The new password to assign}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Break-Glass Emergency Recovery: Reset or recreate the Super Admin account from the server CLI';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->warn('=====================================================');
        $this->warn('  BARANGAY WFP SYSTEM - BREAK-GLASS EMERGENCY RECOVERY');
        $this->warn('=====================================================');

        $email = $this->option('email');
        if (!$email) {
            $email = $this->ask('Enter the Super Admin email address (or press enter for default admin)', 'admin@barangay.gov.ph');
        }

        $password = $this->option('password');
        if (!$password) {
            $password = $this->secret('Enter the new secure password for this Admin');
            $confirm = $this->secret('Confirm the new secure password');

            if ($password !== $confirm) {
                $this->error('Error: Passwords do not match. Aborting recovery.');
                return Command::FAILURE;
            }
        }

        if (strlen($password) < 8) {
            $this->error('Error: Password must be at least 8 characters long.');
            return Command::FAILURE;
        }

        // Check if user exists (including soft-deleted)
        $user = User::withTrashed()->where('email', $email)->first();

        if ($user) {
            $user->restore(); // In case it was soft-deleted
            $user->role = User::ROLE_ADMIN;
            $user->password = Hash::make($password);
            $user->save();

            $this->info("SUCCESS: Existing Super Admin account [{$email}] was restored and password successfully updated!");
        } else {
            $name = $this->ask('Enter the Full Name for this new Super Admin', 'Barangay System Administrator');
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'role' => User::ROLE_ADMIN,
                'password' => Hash::make($password),
            ]);

            $this->info("SUCCESS: Brand-new Super Admin account [{$email}] was provisioned with role 'admin'!");
        }

        $this->table(['Field', 'Value'], [
            ['Name', $user->name],
            ['Email', $user->email],
            ['Role', $user->role],
            ['Status', 'Active / Ready for Login'],
        ]);

        return Command::SUCCESS;
    }
}
