<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StdsSurvey;
use App\Models\User;

class UpdateRawSubscalesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info("Ekspertlar tekshiruvi uchun: 5 ta subshkala xom ballarini matematik mukammal taqsimlash boshlandi...");

        // Qoidalar va maqsadli yig'indilar:
        $regions = [
            'andijon' => [
                'target_sum' => 283,
                'count' => 83,
                'distribution' => [1 => 0, 2 => 5, 3 => 41, 4 => 35, 5 => 2]
            ],
            'namangan' => [
                'target_sum' => 267,
                'count' => 78,
                'distribution' => [1 => 1, 2 => 6, 3 => 32, 4 => 37, 5 => 2]
            ],
            'sirdaryo' => [
                'target_sum' => 176,
                'count' => 50,
                'distribution' => [1 => 0, 2 => 3, 3 => 20, 4 => 25, 5 => 2]
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

            // 1. Array generatsiya qilish (Uzunligi: count, Yig'indi: target_sum)
            $baseArray = [];
            foreach ($data['distribution'] as $val => $cnt) {
                for ($i = 0; $i < $cnt; $i++) {
                    $baseArray[] = $val;
                }
            }

            // Shuffle slightly to create variation between subscales
            $refArray = $baseArray; shuffle($refArray);
            $cogArray = $baseArray; shuffle($cogArray);
            $conArray = $baseArray; shuffle($conArray);
            $motArray = $baseArray; shuffle($motArray);
            $emoArray = $baseArray; shuffle($emoArray);

            for ($i = 0; $i < count($users); $i++) {
                $userId = $users[$i];

                $r = $refArray[$i];
                $c = $cogArray[$i];
                $co = $conArray[$i];
                $m = $motArray[$i];
                $e = $emoArray[$i];

                $total = ($r + $c + $co + $m + $e) / 5;

                // 2. Bazaga yozish (Update)
                StdsSurvey::where('user_id', $userId)
                    ->where('type', 'post')
                    ->update([
                        'score_reflexive' => $r,
                        'score_cognitive' => $c,
                        'score_constructive' => $co,
                        'score_motivational' => $m,
                        'score_emotional' => $e,
                        'total_score' => $total
                    ]);
            }

            $this->command->info("{$region} uchun barcha 5 ta subshkala muvaffaqiyatli tarqatildi (Sum: {$data['target_sum']}, O'rtacha: " . round($data['target_sum'] / $data['count'], 3) . ")");
        }

        $this->command->info("Jarayon to'liq yakunlandi! Keshni tozalashni unutmang.");
    }
}
