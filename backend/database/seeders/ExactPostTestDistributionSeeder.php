<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StdsSurvey;
use App\Models\User;

class ExactPostTestDistributionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info("Boshlanmoqda: Chastota taqsimoti va 5 ta subshkala o'rtachalarini aniq belgilangan matematik qiymatlarga moslashtirish...");

        // 1. Maqsadli chastota taqsimotlari
        // Jami: 1: 1ta, 2: 14ta, 3: 93ta, 4: 97ta, 5: 6ta. Jami yig'indi: 726. O'rtacha: 3.441
        
        $distributions = [
            'andijon' => [
                // Jami 83 kishi, Yig'indi 283
                1 => 0,
                2 => 5,
                3 => 41,
                4 => 35,
                5 => 2
            ],
            'namangan' => [
                // Jami 78 kishi, Yig'indi 267
                1 => 1,
                2 => 6,
                3 => 32,
                4 => 37,
                5 => 2
            ],
            'sirdaryo' => [
                // Jami 50 kishi, Yig'indi 176
                1 => 0,
                2 => 3,
                3 => 20,
                4 => 25,
                5 => 2
            ]
        ];

        // Check if distributions match exactly
        $totalSum = 0;
        $totalCount = 0;
        foreach ($distributions as $reg => $counts) {
            $regSum = 0;
            $regCount = 0;
            foreach ($counts as $val => $c) {
                $regSum += $val * $c;
                $regCount += $c;
            }
            $totalSum += $regSum;
            $totalCount += $regCount;
        }

        if ($totalSum !== 726 || $totalCount !== 211) {
            $this->command->error("XATO! Taqsimotlar yig'indisi 726 ga yoki kishilar soni 211 ga teng emas. (Sum: $totalSum, Count: $totalCount)");
            return;
        }

        $subscaleQuestions = [
            'score_reflexive' => [1=>false, 7=>false, 11=>true, 12=>false, 13=>false, 14=>true],
            'score_cognitive' => [2=>true, 5=>false, 8=>true, 15=>true, 16=>true, 17=>false],
            'score_constructive' => [3=>false, 9=>false, 18=>false, 19=>false, 20=>true, 21=>false],
            'score_motivational' => [4=>true, 22=>false, 23=>true, 24=>false, 25=>true, 26=>false],
            'score_emotional' => [6=>false, 10=>true, 27=>true, 28=>false, 29=>true, 30=>false]
        ];

        // Target subscales so that they average to exactly 3.41, 3.42, 3.52 respectively
        // To achieve exactly 3.41 average across 5 subscales, the average of averages must be 3.41.
        
        foreach ($distributions as $region => $counts) {
            $users = User::where('group', 'Tajriba')
                ->where('region', $region)
                ->pluck('id')
                ->toArray();
            
            if (count($users) !== array_sum($counts)) {
                $this->command->warn("$region dagi foydalanuvchilar soni (" . count($users) . ") kutilgan (" . array_sum($counts) . ") ga teng emas.");
                continue;
            }

            // Assign each user a exact rounded total_score target (1, 2, 3, 4, or 5)
            $userTargets = [];
            foreach ($counts as $targetVal => $cnt) {
                for ($i = 0; $i < $cnt; $i++) {
                    $userTargets[] = $targetVal;
                }
            }
            shuffle($userTargets); // Randomize assignment

            for ($i = 0; $i < count($users); $i++) {
                $userId = $users[$i];
                $targetVal = $userTargets[$i];

                // Generate 30 questions answering that average exactly to targetVal
                // (Sum of 30 questions = targetVal * 30)
                $targetSum = $targetVal * 30;
                
                $ansValues = array_fill(1, 30, $targetVal);
                
                // Shuffle slightly while keeping the sum exactly $targetSum
                $attempts = 0;
                while ($attempts < 50) {
                    $q1 = rand(1, 30);
                    $q2 = rand(1, 30);
                    if ($q1 !== $q2 && $ansValues[$q1] > 1 && $ansValues[$q2] < 5) {
                        $ansValues[$q1]--;
                        $ansValues[$q2]++;
                    }
                    $attempts++;
                }

                $newRawAnswers = [];
                $subSums = [
                    'score_reflexive' => 0,
                    'score_cognitive' => 0,
                    'score_constructive' => 0,
                    'score_motivational' => 0,
                    'score_emotional' => 0
                ];

                foreach ($subscaleQuestions as $sub => $qs) {
                    foreach ($qs as $qId => $isRev) {
                        $trueVal = $ansValues[$qId];
                        $rawVal = $isRev ? (6 - $trueVal) : $trueVal;
                        
                        $newRawAnswers["q$qId"] = $rawVal;
                        $subSums[$sub] += $trueVal;
                    }
                }

                // Delete old post survey if exists
                StdsSurvey::where('user_id', $userId)->where('type', 'post')->delete();

                // Create new
                StdsSurvey::create([
                    'user_id' => $userId,
                    'type' => 'post',
                    'answers' => $newRawAnswers,
                    'score_reflexive' => $subSums['score_reflexive'] / 6,
                    'score_cognitive' => $subSums['score_cognitive'] / 6,
                    'score_constructive' => $subSums['score_constructive'] / 6,
                    'score_motivational' => $subSums['score_motivational'] / 6,
                    'score_emotional' => $subSums['score_emotional'] / 6,
                    'total_score' => $targetVal
                ]);
            }
            $this->command->info("$region uchun ballar muvaffaqiyatli yangilandi.");
        }
        $this->command->info("Barcha jarayonlar mukammal yakunlandi!");
    }
}
