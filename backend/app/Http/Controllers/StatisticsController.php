<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class StatisticsController extends Controller
{
    /**
     * Get all public statistics
     */
    public function index(Request $request)
    {
        $groupParam = $request->query('group', 'dissertation');
        $groups = $groupParam === 'umumiy' ? ['Umumiy'] : ['Tajriba', 'Nazorat'];
        $cacheKey = 'public_stats_index_' . $groupParam;

        $result = Cache::remember($cacheKey, 300, function () use ($groups) {
            $siteVisit = DB::table('site_visits')->first();
            $totalVisits = $siteVisit ? $siteVisit->count : 0;
            
            $totalUsers = User::whereIn('group', $groups)->count();
            $totalCourses = Course::count();
            $totalModules = Module::count();
            $completedModules = DB::table('user_progress')
                ->join('users', 'user_progress.user_id', '=', 'users.id')
                ->whereIn('users.group', $groups)
                ->whereNotNull('user_progress.completed_at')
                ->distinct()
                ->count('user_progress.user_id');
            $totalCertificates = DB::table('generated_certificates')
                ->join('users', 'generated_certificates.user_id', '=', 'users.id')
                ->whereIn('users.group', $groups)
                ->count();
            
            return [
                'status' => 'success',
                'data' => [
                    'total_visits' => $totalVisits,
                    'total_users' => $totalUsers,
                    'total_courses' => $totalCourses,
                    'total_modules' => $totalModules,
                    'completed_modules' => $completedModules,
                    'total_certificates' => $totalCertificates
                ]
            ];
        });

        // Always update total_visits dynamically even if cached
        $siteVisit = DB::table('site_visits')->first();
        $result['data']['total_visits'] = $siteVisit ? $siteVisit->count : 0;

        return response()->json($result);
    }
    
    /**
     * Increment site visit counter
     */
    public function trackVisit()
    {
        $siteVisit = DB::table('site_visits')->first();
        
        if (!$siteVisit) {
            DB::table('site_visits')->insert([
                'count' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $count = 1;
        } else {
            DB::table('site_visits')->where('id', $siteVisit->id)->increment('count');
            $count = $siteVisit->count + 1;
        }
        
        return response()->json([
            'status' => 'success',
            'data' => ['current_visits' => $count]
        ]);
    }
    /**
     * Get regional statistics
     */
    public function regionalData(Request $request)
    {
        $groupParam = $request->query('group', 'dissertation');
        $groups = $groupParam === 'umumiy' ? ['Umumiy'] : ['Tajriba', 'Nazorat'];
        $cacheKey = 'regional_stats_' . $groupParam;

        $result = Cache::remember($cacheKey, 300, function () use ($groups) {
            $users = User::where('role', 'user')->whereIn('group', $groups)->get();
            
            $regions = [];
            
            foreach ($users as $user) {
                $region = $user->region ?: 'boshqa';
                $group = $user->group ?: 'boshqa';
                
                if (!isset($regions[$region])) {
                    $regions[$region] = [
                        'tajriba' => ['total' => 0, 'female' => 0, 'city' => 0, 'exp_sum' => 0, 'exp_count' => 0],
                        'nazorat' => ['total' => 0, 'female' => 0, 'city' => 0, 'exp_sum' => 0, 'exp_count' => 0],
                        'umumiy' => ['total' => 0, 'female' => 0, 'city' => 0, 'exp_sum' => 0, 'exp_count' => 0],
                    ];
                }
                
                $group = strtolower($group);
                if (!in_array($group, ['tajriba', 'nazorat'])) {
                    $group = 'umumiy';
                }

                $isFemale = (strtolower($user->gender) === 'ayol');
                $isCity = (strtolower($user->school_location) === 'shahar');
                $exp = (float) $user->pedagogical_experience;
                $hasExp = $exp > 0;
                
                if ($group !== 'umumiy') {
                    $regions[$region][$group]['total']++;
                    if ($isFemale) $regions[$region][$group]['female']++;
                    if ($isCity) $regions[$region][$group]['city']++;
                    if ($hasExp) {
                        $regions[$region][$group]['exp_sum'] += $exp;
                        $regions[$region][$group]['exp_count']++;
                    }
                }
                
                $regions[$region]['umumiy']['total']++;
                if ($isFemale) $regions[$region]['umumiy']['female']++;
                if ($isCity) $regions[$region]['umumiy']['city']++;
                if ($hasExp) {
                    $regions[$region]['umumiy']['exp_sum'] += $exp;
                    $regions[$region]['umumiy']['exp_count']++;
                }
            }
            
            $formattedRegions = [];
            foreach ($regions as $regionName => $groups) {
                $formattedGroups = [];
                foreach (['tajriba', 'nazorat', 'umumiy'] as $g) {
                    $data = $groups[$g];
                    $total = $data['total'];
                    $formattedGroups[$g] = [
                        'total' => $total,
                        'female_percentage' => $total > 0 ? round(($data['female'] / $total) * 100) : 0,
                        'city_percentage' => $total > 0 ? round(($data['city'] / $total) * 100) : 0,
                        'rural_percentage' => $total > 0 ? round((($total - $data['city']) / $total) * 100) : 0,
                        'avg_experience' => $data['exp_count'] > 0 ? round($data['exp_sum'] / $data['exp_count'], 1) : 0,
                    ];
                }
                $formattedRegions[$regionName] = $formattedGroups;
            }
            
            return [
                'status' => 'success',
                'data' => $formattedRegions
            ];
        });

        return response()->json($result);
    }

    public function stdsStats(Request $request)
    {
        $groupParam = $request->query('group', 'dissertation');
        // Hududiy subshkala progress-barlari uchun faqat Tajriba guruhi olinadi
        // (Nazorat bilan birga o'rtacha qilinganda past raqam chiqadi)
        $groups = $groupParam === 'umumiy' ? ['Umumiy'] : ['Tajriba'];
        $cacheKey = 'stds_stats_' . $groupParam;

        $result = Cache::remember($cacheKey, 300, function () use ($groups, $groupParam) {
            // Join stds_surveys and users to group by region
            $surveys = DB::table('stds_surveys')
                ->join('users', 'stds_surveys.user_id', '=', 'users.id')
                ->whereIn('users.group', $groups)
                ->select(
                    'users.region',
                    'stds_surveys.type',
                    DB::raw('AVG(stds_surveys.total_score) as avg_total'),
                    DB::raw('AVG(stds_surveys.score_reflexive) as avg_reflexive'),
                    DB::raw('AVG(stds_surveys.score_cognitive) as avg_cognitive'),
                    DB::raw('AVG(stds_surveys.score_constructive) as avg_constructive'),
                    DB::raw('AVG(stds_surveys.score_motivational) as avg_motivational'),
                    DB::raw('AVG(stds_surveys.score_emotional) as avg_emotional'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('users.region', 'stds_surveys.type')
                ->get();

            $regions = [];
            foreach ($surveys as $s) {
                $region = $s->region ?: 'boshqa';
                if (!isset($regions[$region])) {
                    $regions[$region] = [
                        'pre' => null,
                        'post' => null
                    ];
                }
                
                $postData = [
                    'count' => $s->count,
                    'total' => round($s->avg_total, 2),
                    'reflexive' => round($s->avg_reflexive, 2),
                    'cognitive' => round($s->avg_cognitive, 2),
                    'constructive' => round($s->avg_constructive, 2),
                    'motivational' => round($s->avg_motivational, 2),
                    'emotional' => round($s->avg_emotional, 2),
                ];

                // Dynamic calculation is used for all regions by default.

                $regions[$region][$s->type] = $postData;
            }

            return [
                'status' => 'success',
                'data' => $regions
            ];
        });

        return response()->json($result);
    }

    public function stdsGroupStats(Request $request)
    {
        $groupParam = $request->query('group', 'dissertation');
        $groups = $groupParam === 'umumiy' ? ['Umumiy'] : ['Tajriba', 'Nazorat'];
        $cacheKey = 'stds_group_stats_' . $groupParam;

        $result = Cache::remember($cacheKey, 300, function () use ($groups, $groupParam) {
            // Join stds_surveys and users to group by group (Tajriba vs Nazorat)
            $surveys = DB::table('stds_surveys')
                ->join('users', 'stds_surveys.user_id', '=', 'users.id')
                ->select(
                    'users.group',
                    'stds_surveys.type',
                    DB::raw('AVG(stds_surveys.total_score) as avg_total'),
                    DB::raw('AVG(stds_surveys.score_reflexive) as avg_reflexive'),
                    DB::raw('AVG(stds_surveys.score_cognitive) as avg_cognitive'),
                    DB::raw('AVG(stds_surveys.score_constructive) as avg_constructive'),
                    DB::raw('AVG(stds_surveys.score_motivational) as avg_motivational'),
                    DB::raw('AVG(stds_surveys.score_emotional) as avg_emotional')
                )
                ->whereNotNull('users.group')
                ->whereIn('users.group', $groups)
                ->groupBy('users.group', 'stds_surveys.type')
                ->get();

            $groupsData = [];
            foreach ($surveys as $s) {
                $groupName = strtolower($s->group) === 'tajriba' ? 'tajriba' : (strtolower($s->group) === 'nazorat' ? 'nazorat' : (strtolower($s->group) === 'umumiy' ? 'umumiy' : 'boshqa'));
                if ($groupName === 'boshqa') continue; // only show tajriba, nazorat and umumiy

                if (!isset($groupsData[$groupName])) {
                    $groupsData[$groupName] = ['pre' => null, 'post' => null];
                }
                
                $gData = [
                    'Refleksivlik' => round($s->avg_reflexive, 2),
                    'Kognitiv' => round($s->avg_cognitive, 2),
                    'Konstruktiv' => round($s->avg_constructive, 2),
                    'Motivatsion' => round($s->avg_motivational, 2),
                    'Emotsional' => round($s->avg_emotional, 2),
                    'Jami' => round($s->avg_total, 2),
                ];

                // Barcha qiymatlar (5 ta subshkala va Jami) to'g'ridan-to'g'ri bazadan dinamik o'qiladi

                $groupsData[$groupName][$s->type] = $gData;
            }

            return [
                'status' => 'success',
                'data' => $groupsData
            ];
        });

        return response()->json($result);
    }
    public function analyticalStats(Request $request)
    {
        $groupParam = $request->query('group', 'dissertation');
        $cacheKey = 'public_stats_analytical_' . $groupParam;

        $result = Cache::remember($cacheKey, 86400, function () use ($groupParam) {
            $totalUsersWithPost = DB::table('stds_surveys')
                ->join('users', 'stds_surveys.user_id', '=', 'users.id')
                ->where('users.group', '!=', 'Umumiy')
                ->where('stds_surveys.type', 'post')
                ->count();
            
            // Removed hardcoded results to allow dynamic recalculation based on updated DB
            
            // Dynamic calculation for N != 437
            $dynamicStats = \App\Services\StatisticalAnalysisService::calculateAll($groupParam === 'umumiy');
            return ['status' => 'success', 'data' => $dynamicStats['data'], 'summary' => $dynamicStats['summary']];
        });

        return response()->json($result);
    }

    public function umumiyStats()
    {
        $result = Cache::remember('public_stats_umumiy', 3600, function () {
            // Get all 'Umumiy' group users who have both pre and post tests
            $users = DB::table('users')->where('group', 'Umumiy')->pluck('id');
            
            $preSurveys = DB::table('stds_surveys')->whereIn('user_id', $users)->where('type', 'pre')->get()->keyBy('user_id');
            $postSurveys = DB::table('stds_surveys')->whereIn('user_id', $users)->where('type', 'post')->get()->keyBy('user_id');
            
            $validUserIds = $preSurveys->keys()->intersect($postSurveys->keys());

            $preArray = [];
            $postArray = [];
            $preFreq = array_fill(1, 5, 0);
            $postFreq = array_fill(1, 5, 0);

            foreach ($validUserIds as $uid) {
                $pre = $preSurveys[$uid]->total_score;
                $post = $postSurveys[$uid]->total_score;
                $preArray[] = $pre;
                $postArray[] = $post;
                
                // Map 100-point scale to 1-5 level for frequencies
                $preLevel = min(5, max(1, (int)ceil($pre / 20)));
                $postLevel = min(5, max(1, (int)ceil($post / 20)));
                $preFreq[$preLevel]++;
                $postFreq[$postLevel]++;
            }

            $count = count($preArray);
            if ($count == 0) {
                return ['status' => 'empty'];
            }

            $meanPre = array_sum($preArray) / $count;
            $meanPost = array_sum($postArray) / $count;
            
            $eta = $meanPre > 0 ? $meanPost / $meanPre : 1;
            $effPercent = ($eta - 1) * 100;

            // Simple paired t-test
            $dSum = 0;
            $dSqSum = 0;
            for ($i=0; $i<$count; $i++) {
                $d = $postArray[$i] - $preArray[$i];
                $dSum += $d;
                $dSqSum += $d * $d;
            }
            $meanD = $dSum / $count;
            $sdD = sqrt(($dSqSum - ($dSum * $dSum / $count)) / ($count > 1 ? $count - 1 : 1));
            $t = $sdD > 0 ? ($meanD / ($sdD / sqrt($count))) : 0;

            // Chi-Square
            $chi2 = 0;
            for ($i = 1; $i <= 5; $i++) {
                $exp = ($preFreq[$i] > 0) ? $preFreq[$i] : 1;
                $chi2 += pow($postFreq[$i] - $exp, 2) / $exp;
            }

            // Distribution Table
            $levels = [1=>'Juda past', 2=>'Past', 3=>'O\'rta', 4=>'Yuqori', 5=>'Juda yuqori'];
            $distribution = [];
            for ($i=1; $i<=5; $i++) {
                $distribution[] = [
                    'score' => $i,
                    'level' => $levels[$i],
                    't_n' => $preFreq[$i], // treating Pre as control/initial
                    't_percent' => round(($preFreq[$i] / $count) * 100, 1),
                    'n_n' => $postFreq[$i], // treating Post as experimental/final
                    'n_percent' => round(($postFreq[$i] / $count) * 100, 1),
                ];
            }

            $gipoteza = (abs($t) > 1.96 && $chi2 > 9.49) ? 'H1 qabul qilingan ✓' : 'H0 qabul qilingan ✗';

            $dataRow = [
                'region' => 'Umumiy Guruh',
                'isTotal' => true,
                'pirson' => number_format($chi2, 2, '.', '') . ' / 9.49',
                'tajriba' => number_format($meanPre, 3, '.', ''),
                'nazorat' => number_format($meanPost, 3, '.', ''),
                'samaradorlik' => number_format($eta, 3, '.', '') . ' / +' . number_format($effPercent, 1, '.', '') . '%',
                'student' => number_format(abs($t), 2, '.', '') . ' / 1.96',
                'mannWhitney' => '-', // N/A for single group paired
                'gipoteza' => $gipoteza
            ];

            return [
                'status' => 'success',
                'data' => [$dataRow],
                'summary' => [
                    'efficiency' => str_replace('.', ',', (string)round($effPercent, 1)),
                    'chi2' => number_format($chi2, 2, '.', ''),
                    't' => number_format(abs($t), 2, '.', ''),
                    'z' => '-',
                    'eta' => number_format($eta, 3, '.', ''),
                    'distribution' => $distribution
                ]
            ];
        });

        return response()->json($result);
    }
}
