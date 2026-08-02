<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SeedUserProgress extends Command
{
    protected $signature = 'progress:seed';
    protected $description = 'Seed user progress to match registered users';

    public function handle()
    {
        $this->info('Starting progress seeding...');

        $users = User::whereNotNull('group')->get(); // Get all students (Tajriba/Nazorat)
        $modules = Module::all();

        if ($modules->isEmpty() || $users->isEmpty()) {
            $this->error('No modules or users found!');
            return;
        }

        $progressData = [];
        $now = Carbon::now();

        // Clear existing progress to avoid duplicates
        DB::table('user_progress')->truncate();

        foreach ($users as $user) {
            foreach ($modules as $module) {
                // Generate a random completion date in the past month
                $completedAt = clone $now;
                $completedAt->subDays(rand(1, 30))->subHours(rand(1, 24));

                $progressData[] = [
                    'user_id' => $user->id,
                    'module_id' => $module->id,
                    'completed_at' => $completedAt,
                    'created_at' => $completedAt,
                    'updated_at' => $completedAt,
                ];
            }
        }

        // Insert in chunks to avoid memory issues
        $chunks = array_chunk($progressData, 50);
        foreach ($chunks as $chunk) {
            DB::table('user_progress')->insert($chunk);
        }

        $this->info('Successfully seeded ' . count($progressData) . ' completed modules!');
    }
}
