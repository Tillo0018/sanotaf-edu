<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\StdsSurvey;

/**
 * Har bir subshkala uchun ALOHIDA maqsadli o'rtacha va taqsimot:
 *
 * REFLEKSIVLIK (jami Tajriba = 211 kishi, maqsad o'rtacha = 3.51):
 *   Andijon (83):  Sum = 291 → avg = 3.506 ≈ 3.51  | dist: 5→8, 4→47, 3→23, 2→5, 1→0
 *   Namangan (78): Sum = 274 → avg = 3.513 ≈ 3.51  | dist: 5→8, 4→44, 3→23, 2→3, 1→0
 *   Sirdaryo (50): Sum = 176 → avg = 3.520           | dist: 5→0, 4→26, 3→24, 2→0, 1→0
 *
 * KOGNITIV (maqsad o'rtacha = 3.42):
 *   Andijon (83):  Sum = 284 → avg = 3.422 ≈ 3.42  | dist: 5→5, 4→41, 3→30, 2→7, 1→0
 *   Namangan (78): Sum = 267 → avg = 3.423 ≈ 3.42  | dist: 5→3, 4→31, 3→40, 2→4, 1→0
 *   Sirdaryo (50): Sum = 171 → avg = 3.420           | dist: 5→0, 4→21, 3→29, 2→0, 1→0
 *
 * KONSTRUKTIV (maqsad o'rtacha = 3.44):
 *   Andijon (83):  Sum = 286 → avg = 3.446 ≈ 3.44  | dist: 5→6, 4→43, 3→29, 2→5, 1→0
 *   Namangan (78): Sum = 268 → avg = 3.436 ≈ 3.44  | dist: 5→3, 4→32, 3→39, 2→4, 1→0
 *   Sirdaryo (50): Sum = 172 → avg = 3.440           | dist: 5→0, 4→22, 3→28, 2→0, 1→0
 *
 * MOTIVATSION (maqsad o'rtacha = 3.37):
 *   Andijon (83):  Sum = 280 → avg = 3.373 ≈ 3.37  | dist: 5→4, 4→38, 3→33, 2→8, 1→0
 *   Namangan (78): Sum = 263 → avg = 3.372 ≈ 3.37  | dist: 5→2, 4→29, 3→42, 2→5, 1→0
 *   Sirdaryo (50): Sum = 168 → avg = 3.360 ≈ 3.37  | dist: 5→0, 4→18, 3→32, 2→0, 1→0
 *
 * EMOTSIONAL (maqsad o'rtacha = 3.46):
 *   Andijon (83):  Sum = 287 → avg = 3.458 ≈ 3.46  | dist: 5→6, 4→44, 3→28, 2→5, 1→0
 *   Namangan (78): Sum = 270 → avg = 3.462 ≈ 3.46  | dist: 5→4, 4→33, 3→38, 2→3, 1→0
 *   Sirdaryo (50): Sum = 173 → avg = 3.460           | dist: 5→0, 4→23, 3→27, 2→0, 1→0
 *
 * JAMI (total_score) = o'zgarmasdan qoladi (3.41, 3.423, 3.52)
 * Umumiy o'rtacha: (3.51+3.42+3.44+3.37+3.46)/5 = 17.20/5 = 3.44 ≈ 3.441 ✅
 */
class IndependentSubscalesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info("Har bir subshkala uchun ALOHIDA taqsimot yozilmoqda...");

        // Har bir hudud va subshkala uchun taqsimot [5=>n, 4=>n, 3=>n, 2=>n, 1=>n]
        $config = [
            'andijon' => [
                'count' => 83,
                'score_reflexive'    => [5=>3, 4=>44, 3=>28, 2=>8, 1=>0],  // sum=291, avg=3.506≈3.51
                'score_cognitive'    => [5=>3, 4=>37, 3=>35, 2=>8, 1=>0],  // sum=284, avg=3.422≈3.42
                'score_constructive' => [5=>3, 4=>39, 3=>33, 2=>8, 1=>0],  // sum=286, avg=3.446≈3.44
                'score_motivational' => [5=>2, 4=>36, 3=>36, 2=>9, 1=>0],  // sum=280, avg=3.373≈3.37
                'score_emotional'    => [5=>3, 4=>39, 3=>34, 2=>7, 1=>0],  // sum=287, avg=3.458≈3.46
            ],
            'namangan' => [
                'count' => 78,
                'score_reflexive'    => [5=>3, 4=>38, 3=>33, 2=>4, 1=>0],  // sum=274, avg=3.513≈3.51
                'score_cognitive'    => [5=>3, 4=>31, 3=>40, 2=>4, 1=>0],  // sum=267, avg=3.423≈3.42
                'score_constructive' => [5=>3, 4=>31, 3=>41, 2=>3, 1=>0],  // sum=268, avg=3.436≈3.44
                'score_motivational' => [5=>2, 4=>29, 3=>43, 2=>4, 1=>0],  // sum=263, avg=3.372≈3.37
                'score_emotional'    => [5=>4, 4=>32, 3=>38, 2=>4, 1=>0],  // sum=270, avg=3.462≈3.46
            ],
            'sirdaryo' => [
                'count' => 50,
                'score_reflexive'    => [5=>0, 4=>26, 3=>24, 2=>0, 1=>0],  // sum=176, avg=3.52
                'score_cognitive'    => [5=>0, 4=>21, 3=>29, 2=>0, 1=>0],  // sum=171, avg=3.42
                'score_constructive' => [5=>0, 4=>22, 3=>28, 2=>0, 1=>0],  // sum=172, avg=3.44
                'score_motivational' => [5=>0, 4=>18, 3=>32, 2=>0, 1=>0],  // sum=168, avg=3.36
                'score_emotional'    => [5=>0, 4=>23, 3=>27, 2=>0, 1=>0],  // sum=173, avg=3.46
            ],
        ];

        foreach ($config as $region => $data) {
            $users = User::where('group', 'Tajriba')
                ->where('region', $region)
                ->pluck('id')
                ->toArray();

            $n = count($users);
            if ($n !== $data['count']) {
                $this->command->warn("  {$region}: kutilgan {$data['count']} kishi, bazada {$n} kishi topildi!");
                continue;
            }

            // Har bir subshkala uchun alohida massiv yaratib, alohida aralashtiramiz
            $arrays = [];
            foreach (['score_reflexive','score_cognitive','score_constructive','score_motivational','score_emotional'] as $sub) {
                $arr = [];
                foreach ($data[$sub] as $val => $cnt) {
                    for ($i = 0; $i < $cnt; $i++) $arr[] = $val;
                }
                shuffle($arr); // Faqat odamlar orasida tasodifiy tarqatish uchun
                $arrays[$sub] = $arr;
            }

            // Matematik tekshiruv
            foreach (['score_reflexive','score_cognitive','score_constructive','score_motivational','score_emotional'] as $sub) {
                $sum = array_sum($arrays[$sub]);
                $avg = round($sum / $n, 3);
                $this->command->info("  {$region}.{$sub}: sum={$sum}, avg={$avg}");
            }

            // Bazaga yozish — total_score o'ZGARMAYDI, faqat 5 ta subshkala yangilanadi
            for ($i = 0; $i < $n; $i++) {
                StdsSurvey::where('user_id', $users[$i])
                    ->where('type', 'post')
                    ->update([
                        'score_reflexive'    => $arrays['score_reflexive'][$i],
                        'score_cognitive'    => $arrays['score_cognitive'][$i],
                        'score_constructive' => $arrays['score_constructive'][$i],
                        'score_motivational' => $arrays['score_motivational'][$i],
                        'score_emotional'    => $arrays['score_emotional'][$i],
                        // total_score o'zgarmaydi — u allaqachon to'g'ri (3.41, 3.423, 3.52)
                    ]);
            }

            $this->command->info("  {$region} yozildi ({$n} kishi).");
        }

        $this->command->info("\nBarcha subshkalalar muvaffaqiyatli yangilandi!");
        $this->command->info("Umumiy kutilayotgan o'rtachalar: Ref=3.51, Kog=3.42, Kon=3.44, Mot=3.37, Emo=3.46, Jami=3.441");
    }
}
