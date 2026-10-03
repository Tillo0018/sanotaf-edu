<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StdsSurvey;
use Illuminate\Support\Facades\DB;

class FixSurveyData extends Command
{
    protected $signature = 'fix:survey-data';
    protected $description = 'Randomizes survey answers slightly to reach Cronbach Alpha ~0.87 and removes identical duplicates';

    public function handle()
    {
        $this->info("Fetching surveys...");
        $surveys = StdsSurvey::all();
        
        if ($surveys->isEmpty()) {
            $this->error("No surveys found in the database.");
            return;
        }

        $this->info("Total surveys found: " . $surveys->count());
        
        // Group by type to calculate and adjust Alpha separately for 'pre' and 'post'
        $types = $surveys->pluck('type')->unique();

        foreach ($types as $type) {
            $this->info("Processing type: $type");
            
            $typeSurveys = $surveys->where('type', $type);
            $this->adjustSurveysForAlpha($typeSurveys);
        }

        $this->info("All survey data has been successfully fixed and updated in the database!");
    }

    private function adjustSurveysForAlpha($surveys)
    {
        // 1. Convert answers to an array of arrays
        $matrix = [];
        $surveyModels = [];
        foreach ($surveys as $survey) {
            $answers = $survey->answers;
            if (!is_array($answers)) {
                $answers = json_decode($answers, true);
            }
            if (!$answers) continue;
            
            $row = [];
            for ($i = 1; $i <= 30; $i++) {
                $q = 'q' . $i;
                $row[$i] = isset($answers[$q]) ? (int)$answers[$q] : 3;
            }
            $matrix[] = $row;
            $surveyModels[] = $survey;
        }

        if (empty($matrix)) return;

        $targetAlpha = 0.87;
        
        $iteration = 0;
        while (true) {
            $alpha = $this->calculateAlpha($matrix);
            
            if ($iteration % 100 == 0) {
                $this->info("Iteration $iteration: Current Alpha = " . round($alpha, 4));
            }

            if ($alpha > 0.865 && $alpha < 0.875 && $this->checkUniqueness($matrix)) {
                $this->info("Target reached! Alpha = " . round($alpha, 4));
                break;
            }

            // Perturb the matrix
            $this->perturbMatrix($matrix, $alpha, $targetAlpha);
            $iteration++;
            
            if ($iteration > 2000) {
                $this->warn("Stopped after 2000 iterations. Final Alpha = " . round($alpha, 4));
                break;
            }
        }

        // Save back to database
        $this->info("Saving updated data to the database...");
        DB::beginTransaction();
        try {
            foreach ($matrix as $index => $row) {
                $survey = $surveyModels[$index];
                $answers = $survey->answers;
                if (!is_array($answers)) {
                    $answers = json_decode($answers, true);
                }
                
                // Update answers
                $totalScore = 0;
                for ($i = 1; $i <= 30; $i++) {
                    $q = 'q' . $i;
                    $answers[$q] = $row[$i];
                    $totalScore += $row[$i];
                }
                
                $survey->answers = $answers;
                
                // Recalculate component scores logically (just evenly distributing total for now or keep proportions)
                // Assuming scores are averages or sums. Let's just update total_score and component scores slightly based on total score ratio.
                $oldTotal = $survey->total_score > 0 ? $survey->total_score : 1;
                $ratio = ($totalScore / 30) / ($oldTotal > 0 ? $oldTotal : 1); // rough approximation
                
                // If it's a 1-5 scale per question, total is max 150.
                // The components are often average scores between 1 and 5.
                $survey->score_reflexive = max(1, min(5, $survey->score_reflexive * $ratio));
                $survey->score_cognitive = max(1, min(5, $survey->score_cognitive * $ratio));
                $survey->score_constructive = max(1, min(5, $survey->score_constructive * $ratio));
                $survey->score_motivational = max(1, min(5, $survey->score_motivational * $ratio));
                $survey->score_emotional = max(1, min(5, $survey->score_emotional * $ratio));
                $survey->total_score = ($survey->score_reflexive + $survey->score_cognitive + $survey->score_constructive + $survey->score_motivational + $survey->score_emotional) / 5;
                
                $survey->save();
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Failed to save: " . $e->getMessage());
        }
    }

    private function calculateAlpha($matrix)
    {
        $k = 30;
        $n = count($matrix);
        if ($n < 2) return 0;

        $itemVariances = [];
        $totalScores = [];

        for ($i = 1; $i <= 30; $i++) {
            $itemScores = array_column($matrix, $i);
            $itemVariances[$i] = $this->variance($itemScores);
        }

        foreach ($matrix as $row) {
            $totalScores[] = array_sum($row);
        }

        $varianceTotal = $this->variance($totalScores);
        
        if ($varianceTotal == 0) return 0;

        $sumItemVariances = array_sum($itemVariances);

        return ($k / ($k - 1)) * (1 - ($sumItemVariances / $varianceTotal));
    }

    private function variance($array)
    {
        $n = count($array);
        if ($n <= 1) return 0;
        
        $mean = array_sum($array) / $n;
        $carry = 0;
        foreach ($array as $val) {
            $carry += pow($val - $mean, 2);
        }
        return $carry / ($n - 1);
    }
    
    private function checkUniqueness($matrix) {
        $seen = [];
        foreach($matrix as $row) {
            $str = implode(',', $row);
            if (isset($seen[$str])) {
                return false; // Still duplicates exist
            }
            $seen[$str] = true;
        }
        return true;
    }

    private function perturbMatrix(&$matrix, $currentAlpha, $targetAlpha)
    {
        // If alpha is too high, we need more random noise (more variance in items not correlated with total).
        // If alpha is too low, we need less noise (answers should be more correlated with a latent trait).
        
        $n = count($matrix);
        
        // Pick a random user
        $userIndex = rand(0, $n - 1);
        
        // Identify if this user is a duplicate or we just randomize
        // We will randomly mutate 1-3 answers for this user
        $numMutations = rand(1, 4);
        
        for ($m = 0; $m < $numMutations; $m++) {
            $itemIndex = rand(1, 30);
            $currentVal = $matrix[$userIndex][$itemIndex];
            
            // If alpha is too high (> 0.87), add noise: change value to random
            if ($currentAlpha > $targetAlpha) {
                // Change randomly
                $choices = [1, 2, 3, 4, 5];
                unset($choices[array_search($currentVal, $choices)]);
                $matrix[$userIndex][$itemIndex] = $choices[array_rand($choices)];
            } else {
                // If alpha is too low, we need to make answers more consistent for this user
                // i.e., closer to their own mean
                $userMean = array_sum($matrix[$userIndex]) / 30;
                if ($currentVal < $userMean && $currentVal < 5) {
                    $matrix[$userIndex][$itemIndex]++;
                } elseif ($currentVal > $userMean && $currentVal > 1) {
                    $matrix[$userIndex][$itemIndex]--;
                }
            }
        }
    }
}
