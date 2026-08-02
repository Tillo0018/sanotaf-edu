<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StdsSurvey;
use App\Models\User;

class ExactRawScoresSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info("Qat'iy matematik taqsimot asosida xom ballarni yozish boshlandi...");

        // User provided exact distribution:
        $regions = [
            'andijon' => [
                'target_sum' => 283,
                'count' => 83,
                'distribution' => [5 => 3, 4 => 40, 3 => 29, 2 => 10, 1 => 1]
            ],
            'namangan' => [
                'target_sum' => 267,
                'count' => 78,
                'distribution' => [5 => 3, 4 => 31, 3 => 40, 2 => 4, 1 => 0]
            ],
            'sirdaryo' => [
                'target_sum' => 176,
                'count' => 50,
                'distribution' => [5 => 0, 4 => 26, 3 => 24, 2 => 0, 1 => 0]
            ]
        ];

        foreach ($regions as $region => $data) {
            $users = User::where('group', 'Tajriba')
                ->where('region', $region)
                ->pluck('id')
                ->toArray();

            if (count($users) !== $data['count']) {
                $this->command->warn("{$region} ishtirokchilar soni (" . count($users) . ") bazada {$data['count']} ga teng emas!");
                continue;
            }

            // 1. O'sha qat'iy distribution'dan massiv yaratamiz
            $baseArray = [];
            foreach ($data['distribution'] as $val => $cnt) {
                for ($i = 0; $i < $cnt; $i++) {
                    $baseArray[] = $val;
                }
            }

            // Shuffle ni faqat odamlarga tarqatishda ishlatamiz (shunda qaysi ID qaysi ball olishi tasodifiy bo'ladi, 
            // lekin uning barcha 5 ta subshkalasi faqat o'sha yagona ballga aylanadi).
            // O'zingiz aytganingizdek subshkalalar orasida umuman shuffle bo'lmaydi!
            shuffle($baseArray);

            for ($i = 0; $i < count($users); $i++) {
                $userId = $users[$i];
                $score = $baseArray[$i]; // Misol: 4

                // 2. Bazaga yangilab yozish: barcha 5 ta subshkala va total_score = $score (bir xil qilib yoziladi)
                StdsSurvey::where('user_id', $userId)
                    ->where('type', 'post')
                    ->update([
                        'score_reflexive' => $score,
                        'score_cognitive' => $score,
                        'score_constructive' => $score,
                        'score_motivational' => $score,
                        'score_emotional' => $score,
                        'total_score' => $score
                    ]);
            }

            $this->command->info("{$region} uchun ballar yozildi (Sum: {$data['target_sum']}, O'rtacha: " . round($data['target_sum'] / $data['count'], 3) . ")");
        }

        $this->command->info("Barcha hududlar bo'yicha ma'lumotlar saqlandi! Jami o'rtacha: 3.441");
    }
}
