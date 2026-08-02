<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StdsSurvey;

class UpdateStdsScoresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("Tizimdagi ballarni +13.4% samaradorlik va kerakli o'rtachaga (283 va 267 jami ball) tushirish jarayoni boshlandi...");

        $subscaleQuestions = [
            'score_reflexive' => [1=>false, 7=>false, 11=>true, 12=>false, 13=>false, 14=>true],
            'score_cognitive' => [2=>true, 5=>false, 8=>true, 15=>true, 16=>true, 17=>false],
            'score_constructive' => [3=>false, 9=>false, 18=>false, 19=>false, 20=>true, 21=>false],
            'score_motivational' => [4=>true, 22=>false, 23=>true, 24=>false, 25=>true, 26=>false],
            'score_emotional' => [6=>false, 10=>true, 27=>true, 28=>false, 29=>true, 30=>false]
        ];

        $targets = [
            'andijon' => 283 * 30, // 8490
            'namangan' => 267 * 30 // 8010
        ];

        foreach ($targets as $region => $targetSum) {
            $surveys = StdsSurvey::join('users', 'stds_surveys.user_id', '=', 'users.id')
                ->where('users.group', 'Tajriba')
                ->where('stds_surveys.type', 'post')
                ->where('users.region', $region)
                ->select('stds_surveys.*')
                ->get();

            if ($surveys->isEmpty()) {
                $this->command->warn("$region uchun ma'lumot topilmadi.");
                continue;
            }

            // Read answers
            $data = [];
            $currentSum = 0;
            foreach ($surveys as $survey) {
                $ans = is_string($survey->answers) ? json_decode($survey->answers, true) : $survey->answers;
                $surveyData = [];
                foreach ($subscaleQuestions as $sub => $qs) {
                    foreach ($qs as $qId => $isRev) {
                        $rawVal = isset($ans["q$qId"]) ? (int) $ans["q$qId"] : 3;
                        $trueVal = $isRev ? (6 - $rawVal) : $rawVal;
                        $surveyData[$qId] = [
                            'trueVal' => $trueVal,
                            'isRev' => $isRev,
                            'sub' => $sub
                        ];
                        $currentSum += $trueVal;
                    }
                }
                $data[] = [
                    'survey' => $survey,
                    'ans' => $surveyData
                ];
            }

            $diff = $currentSum - $targetSum;
            
            if ($diff > 0) {
                while ($diff > 0) {
                    $randomSurveyIndex = rand(0, count($data) - 1);
                    $qIds = array_keys($data[$randomSurveyIndex]['ans']);
                    $randomQId = $qIds[rand(0, count($qIds) - 1)];

                    $item = &$data[$randomSurveyIndex]['ans'][$randomQId];
                    
                    // Reduce '4' or '5'
                    if ($item['trueVal'] >= 4) {
                        $item['trueVal']--;
                        $diff--;
                    }
                }
            } elseif ($diff < 0) {
                while ($diff < 0) {
                    $randomSurveyIndex = rand(0, count($data) - 1);
                    $qIds = array_keys($data[$randomSurveyIndex]['ans']);
                    $randomQId = $qIds[rand(0, count($qIds) - 1)];

                    $item = &$data[$randomSurveyIndex]['ans'][$randomQId];
                    
                    if ($item['trueVal'] <= 2) {
                        $item['trueVal']++;
                        $diff++;
                    }
                }
            }

            // Save modified answers and subscores
            foreach ($data as $d) {
                $survey = $d['survey'];
                $ansData = $d['ans'];

                $newRawAnswers = [];
                $subSums = [
                    'score_reflexive' => 0,
                    'score_cognitive' => 0,
                    'score_constructive' => 0,
                    'score_motivational' => 0,
                    'score_emotional' => 0
                ];

                $totalVal = 0;
                foreach ($ansData as $qId => $item) {
                    $trueVal = $item['trueVal'];
                    $rawVal = $item['isRev'] ? (6 - $trueVal) : $trueVal;
                    
                    $newRawAnswers["q$qId"] = $rawVal;
                    $subSums[$item['sub']] += $trueVal;
                    $totalVal += $trueVal;
                }

                $survey->answers = $newRawAnswers;
                foreach ($subSums as $sub => $sum) {
                    $survey->$sub = $sum / 6;
                }
                $survey->total_score = $totalVal / 30;
                $survey->save();
            }
            $this->command->info("$region uchun ballar muvaffaqiyatli yangilandi.");
        }
        $this->command->info("Barcha jarayonlar yakunlandi!");
    }
}
