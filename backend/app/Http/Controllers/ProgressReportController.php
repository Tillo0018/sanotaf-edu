<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use App\Models\UserAnswer;
use App\Models\Course;

class ProgressReportController extends Controller
{
    public function getDetails(Request $request)
    {
        $userId = $request->user()->id;

        $modulesProgress = UserProgress::with(['module.course'])
            ->where('user_id', $userId)
            ->orderBy('completed_at', 'desc')
            ->get();

        $quizHistory = UserAnswer::with(['question.module.course'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $courses = Course::withCount('modules')->get();
        $completedCourses = [];
        
        foreach($courses as $course) {
            $completedModulesCount = UserProgress::where('user_id', $userId)
                ->whereHas('module', function($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                ->count();
                
            if ($course->modules_count > 0 && $completedModulesCount === $course->modules_count) {
                $completedCourses[] = $course;
            }
        }

        return response()->json([
            'status' => 'success',
            'modules' => $modulesProgress,
            'history' => $quizHistory,
            'completed_courses' => $completedCourses
        ], 200);
    }
}
