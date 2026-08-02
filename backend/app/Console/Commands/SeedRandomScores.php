<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SeedRandomScores extends Command
{
    protected $signature = 'scores:randomize';
    protected $description = 'Randomize user scores and comprehensively seed answers for all modules';

    public function handle()
    {
        $this->info('Starting comprehensive score and answer seeding...');

        $users = User::whereNotNull('group')->get();
        $modules = DB::table('modules')->get();

        if ($users->isEmpty() || $modules->isEmpty()) {
            $this->error('No users or modules found!');
            return;
        }

        // Ensure every module has at least 2 questions
        foreach ($modules as $module) {
            $qCount = DB::table('questions')->where('module_id', $module->id)->count();
            if ($qCount < 2) {
                DB::table('questions')->insert([
                    ['module_id' => $module->id, 'question_text' => $module->title . ' bo\'yicha tushunchangizni qanday amaliyotda qo\'llaysiz?', 'type' => 'open', 'created_at' => now(), 'updated_at' => now()],
                    ['module_id' => $module->id, 'question_text' => 'Ushbu mavzuda eng ko\'p e\'tibor qaratilishi kerak bo\'lgan jihat nima?', 'type' => 'open', 'created_at' => now(), 'updated_at' => now()]
                ]);
            }
        }
        
        $allQuestions = DB::table('questions')->get()->groupBy('module_id');
        
        $now = Carbon::now();
        $answersToInsert = [];
        
        // Truncate answers to avoid duplicates
        DB::table('user_answers')->truncate();

        foreach ($users as $user) {
            $targetTotalScore = rand(70, 100);
            $moduleProgresses = DB::table('user_progress')->where('user_id', $user->id)->get();
            
            if ($moduleProgresses->count() > 0) {
                $baseScore = floor($targetTotalScore / $moduleProgresses->count());
                $remainder = $targetTotalScore % $moduleProgresses->count();
                
                $idx = 0;
                foreach ($moduleProgresses as $progress) {
                    $scoreForThisModule = $baseScore;
                    if ($idx < $remainder) {
                        $scoreForThisModule++;
                    }
                    DB::table('user_progress')->where('id', $progress->id)->update(['score' => $scoreForThisModule]);
                    
                    // Add answers for this module's questions
                    $moduleQuestions = $allQuestions->get($progress->module_id);
                    if ($moduleQuestions) {
                        foreach ($moduleQuestions as $q) {
                            // High score -> more likely to be correct
                            $isCorrectChance = ($scoreForThisModule >= 10) ? 90 : 60; 
                            $isCorrect = rand(0, 100) <= $isCorrectChance;
                            
                            if ($isCorrect) {
                                $answerText = "Mavzuni to'liq o'zlashtirdim va hayotiy vaziyatlarda qo'llay olaman. Sanogen tafakkur bu yerda muhim ahamiyat kasb etadi.";
                                $feedback = "Juda yaxshi! Fikringiz aniq va mavzuga to'liq mos keladi.";
                            } else {
                                $answerText = "Men bu vaziyatda odatdagi reaksiyam bilan harakat qilardim. Ba'zida ehtirosga berilib ketaman.";
                                $feedback = "Javobingiz qisman to'g'ri. Ammo mualliflik metodikasiga ko'ra, siz sanogen usullarni ko'proq jalb qilishingiz va xolis yondashishingiz kutiladi.";
                            }

                            // Keep timestamps logically before they completed the module
                            $answeredAt = (new Carbon($progress->completed_at))->subMinutes(rand(5, 120));

                            $answersToInsert[] = [
                                'user_id' => $user->id,
                                'question_id' => $q->id,
                                'answer_text' => $answerText,
                                'ai_feedback' => $feedback,
                                'is_correct' => $isCorrect,
                                'created_at' => $answeredAt,
                                'updated_at' => $answeredAt,
                            ];
                        }
                    }
                    $idx++;
                }
            }
        }

        // Insert answers in chunks
        $chunks = array_chunk($answersToInsert, 500);
        foreach ($chunks as $chunk) {
            DB::table('user_answers')->insert($chunk);
        }

        $this->info('Successfully updated questions, randomized scores, and seeded complete test history for all modules!');
    }
}
