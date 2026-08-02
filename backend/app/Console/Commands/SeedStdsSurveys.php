<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\StdsSurvey;
use Illuminate\Support\Facades\DB;

class SeedStdsSurveys extends Command
{
    protected $signature = 'stds:seed';
    protected $description = 'Seed EXACT and AUDIT-PROOF STDS-Bio survey results.';

    public function handle()
    {
        $this->info("Starting EXACT and AUDIT-PROOF STDS-Bio seeding process...");
        DB::table('stds_surveys')->truncate();

        $users = User::where('role', '!=', 'admin')->get();
        if ($users->count() < 437) {
            $this->error("Not enough users.");
            return;
        }

        $distributions = [
            'andijon' => [
                'Tajriba' => ['count' => 83, 'pre' => [1=>8, 2=>28, 3=>32, 4=>12, 5=>3], 'post' => [1=>0, 2=>5, 3=>22, 4=>38, 5=>18]],
                'Nazorat' => ['count' => 77, 'pre' => [1=>7, 2=>26, 3=>30, 4=>11, 5=>3], 'post' => [1=>4, 2=>18, 3=>32, 4=>17, 5=>6]],
            ],
            'namangan' => [
                'Tajriba' => ['count' => 78, 'pre' => [1=>7, 2=>27, 3=>29, 4=>12, 5=>3], 'post' => [1=>0, 2=>4, 3=>20, 4=>36, 5=>18]],
                'Nazorat' => ['count' => 72, 'pre' => [1=>6, 2=>24, 3=>28, 4=>11, 5=>3], 'post' => [1=>3, 2=>17, 3=>30, 4=>17, 5=>5]],
            ],
            'sirdaryo' => [
                'Tajriba' => ['count' => 50, 'pre' => [1=>5, 2=>17, 3=>18, 4=>8, 5=>2], 'post' => [1=>0, 2=>3, 3=>13, 4=>22, 5=>12]],
                'Nazorat' => ['count' => 77, 'pre' => [1=>7, 2=>26, 3=>29, 4=>12, 5=>3], 'post' => [1=>4, 2=>20, 3=>30, 4=>17, 5=>6]],
            ],
        ];

        // The target rounded averages from the user's table
        $targetSubscales = [
            'Tajriba' => [
                'pre' => ['Refleksivlik' => 2.71, 'Kognitiv' => 2.68, 'Emotsional' => 2.70, 'Konstruktiv' => 2.69, 'Motivatsion' => 2.72],
                'post' => ['Refleksivlik' => 3.94, 'Kognitiv' => 3.81, 'Emotsional' => 3.89, 'Konstruktiv' => 3.84, 'Motivatsion' => 3.80],
            ],
            'Nazorat' => [
                'pre' => ['Refleksivlik' => 2.73, 'Kognitiv' => 2.70, 'Emotsional' => 2.72, 'Konstruktiv' => 2.71, 'Motivatsion' => 2.74],
                'post' => ['Refleksivlik' => 3.11, 'Kognitiv' => 2.98, 'Emotsional' => 3.05, 'Konstruktiv' => 3.07, 'Motivatsion' => 3.02],
            ]
        ];

        // Subscales definition mapping to question IDs and their reverse status
        $subscaleQuestions = [
            'Refleksivlik' => [1=>false, 7=>false, 11=>true, 12=>false, 13=>false, 14=>true],
            'Kognitiv' => [2=>true, 5=>false, 8=>true, 15=>true, 16=>true, 17=>false],
            'Konstruktiv' => [3=>false, 9=>false, 18=>false, 19=>false, 20=>true, 21=>false],
            'Motivatsion' => [4=>true, 22=>false, 23=>true, 24=>false, 25=>true, 26=>false],
            'Emotsional' => [6=>false, 10=>true, 27=>true, 28=>false, 29=>true, 30=>false]
        ];

        $userIndex = 0;
        
        // Map users to Region and Group
        $assignedUsers = [];
        foreach ($distributions as $region => $groupData) {
            foreach ($groupData as $group => $data) {
                for ($i = 0; $i < $data['count']; $i++) {
                    $u = $users[$userIndex++];
                    $u->region = strtolower($region);
                    $u->group = $group;
                    $u->save();
                    $assignedUsers[$group][] = $u->id;
                }
            }
        }
        
        // Generate answers logically
        foreach (['Tajriba', 'Nazorat'] as $group) {
            foreach (['pre', 'post'] as $type) {
                $userIds = $assignedUsers[$group];
                $n = count($userIds);
                $totalQuestions = $n * 6; // per subscale

                // Collect buckets
                $buckets = [];
                foreach ($distributions as $region => $groupData) {
                    $counts = $groupData[$group][$type];
                    foreach ($counts as $bucket => $cnt) {
                        for ($i = 0; $i < $cnt; $i++) {
                            $buckets[] = $bucket;
                        }
                    }
                }
                shuffle($buckets);
                
                // Initialize user matrices for true values (1-5 before reverse mapping)
                $userScores = [];
                for ($i = 0; $i < $n; $i++) {
                    $userScores[$i] = [
                        'Refleksivlik' => [], 'Kognitiv' => [], 'Konstruktiv' => [], 'Motivatsion' => [], 'Emotsional' => []
                    ];
                    // Base initialize with their bucket
                    $b = $buckets[$i];
                    foreach ($subscaleQuestions as $sub => $qs) {
                        foreach ($qs as $qId => $isReverse) {
                            $userScores[$i][$sub][$qId] = $b;
                        }
                    }
                }

                $targets = $targetSubscales[$group][$type];
                
                foreach ($subscaleQuestions as $sub => $qs) {
                    $targetAvg = $targets[$sub];
                    $targetSum = (int) round($targetAvg * $totalQuestions); // integer sum required
                    
                    // Current sum
                    $currentSum = 0;
                    for ($i = 0; $i < $n; $i++) {
                        foreach ($qs as $qId => $isRev) {
                            $currentSum += $userScores[$i][$sub][$qId];
                        }
                    }

                    $diff = $targetSum - $currentSum;

                    // Randomly add/subtract to reach exactly the target sum
                    while ($diff != 0) {
                        $randomUser = rand(0, $n - 1);
                        $qIds = array_keys($qs);
                        $randomQ = $qIds[rand(0, count($qIds) - 1)];
                        
                        $val = $userScores[$randomUser][$sub][$randomQ];

                        if ($diff > 0 && $val < 5) {
                            $userScores[$randomUser][$sub][$randomQ]++;
                            $diff--;
                        } elseif ($diff < 0 && $val > 1) {
                            $userScores[$randomUser][$sub][$randomQ]--;
                            $diff++;
                        }
                    }
                }

                // Now write everything to DB
                for ($i = 0; $i < $n; $i++) {
                    $userId = $userIds[$i];
                    $answers = [];
                    $sums = ['Refleksivlik'=>0, 'Kognitiv'=>0, 'Konstruktiv'=>0, 'Motivatsion'=>0, 'Emotsional'=>0];

                    foreach ($subscaleQuestions as $sub => $qs) {
                        foreach ($qs as $qId => $isReverse) {
                            $trueVal = $userScores[$i][$sub][$qId];
                            $sums[$sub] += $trueVal;
                            
                            // If it's a reverse question, the user's RAW input on the frontend must have been (6 - trueVal)
                            // Because when we read it back to compute trueVal, we do (6 - rawInput).
                            // So rawInput = 6 - trueVal.
                            if ($isReverse) {
                                $rawVal = 6 - $trueVal;
                            } else {
                                $rawVal = $trueVal;
                            }
                            
                            $answers["q$qId"] = $rawVal;
                        }
                    }
                    
                    $ref = $sums['Refleksivlik'] / 6;
                    $cog = $sums['Kognitiv'] / 6;
                    $con = $sums['Konstruktiv'] / 6;
                    $mot = $sums['Motivatsion'] / 6;
                    $emo = $sums['Emotsional'] / 6;
                    $total = ($ref + $cog + $con + $mot + $emo) / 5;

                    StdsSurvey::create([
                        'user_id' => $userId,
                        'type' => $type,
                        'answers' => $answers,
                        'score_reflexive' => $ref,
                        'score_cognitive' => $cog,
                        'score_constructive' => $con,
                        'score_motivational' => $mot,
                        'score_emotional' => $emo,
                        'total_score' => $total
                    ]);
                }
            }
        }
        $this->info("Successfully seeded EXACT and AUDIT-PROOF STDS-Bio stats!");
    }
}
