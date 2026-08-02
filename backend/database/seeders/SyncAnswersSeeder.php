<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StdsSurvey;
use App\Models\User;

class SyncAnswersSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info("Ishtirokchilarning JSON 'answers' xom javoblarini total_score ga qat'iy moslash boshlandi...");

        // Reverse questions list
        $subscaleQuestions = [
            'score_reflexive' => [1=>false, 7=>false, 11=>true, 12=>false, 13=>false, 14=>true],
            'score_cognitive' => [2=>true, 5=>false, 8=>true, 15=>true, 16=>true, 17=>false],
            'score_constructive' => [3=>false, 9=>false, 18=>false, 19=>false, 20=>true, 21=>false],
            'score_motivational' => [4=>true, 22=>false, 23=>true, 24=>false, 25=>true, 26=>false],
            'score_emotional' => [6=>false, 10=>true, 27=>true, 28=>false, 29=>true, 30=>false]
        ];

        // Tajriba guruhi post-testlarini olamiz
        $users = User::where('group', 'Tajriba')->pluck('id')->toArray();
        $surveys = StdsSurvey::whereIn('user_id', $users)->where('type', 'post')->get();

        foreach ($surveys as $survey) {
            $ts = (int)$survey->total_score; // 1, 2, 3, 4, 5 qat'iy tushgan ball

            $newAnswers = [];
            foreach ($subscaleQuestions as $sub => $qs) {
                foreach ($qs as $qId => $isRev) {
                    // Agar isRev bo'lsa, 6 dan ayiramiz. Chunki teskari hisoblashda 6 - (6-ts) = ts chiqadi
                    $newAnswers["q$qId"] = $isRev ? (6 - $ts) : $ts;
                }
            }

            // Javoblar soni aynan 30 ta bo'lishi kafolatlanadi (5 x 6 = 30)
            $survey->answers = $newAnswers;
            $survey->save();
        }

        $this->command->info("Barcha Tajriba (Post-test) ishtirokchilarining JSON 'answers' maydonlari total_score ga moslab to'liq yangilandi.");
    }
}
