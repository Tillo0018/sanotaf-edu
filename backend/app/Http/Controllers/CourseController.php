<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Barcha kurslarni qaytaradi
     */
    public function index()
    {
        $courses = Course::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'courses' => $courses
        ]);
    }

    /**
     * Muayyan kursni va uning modullarini qaytaradi
     */
    public function show(Request $request, $id)
    {
        $course = Course::with('modules.questions')->find($id);

        if (!$course) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kurs topilmadi'
            ], 404);
        }

        $completedModuleIds = [];
        if ($request->user()) {
            $completedModuleIds = \App\Models\UserProgress::where('user_id', $request->user()->id)
                ->whereIn('module_id', $course->modules->pluck('id'))
                ->pluck('module_id')
                ->toArray();
        }

        return response()->json([
            'status' => 'success',
            'course' => $course,
            'completed_module_ids' => $completedModuleIds
        ]);
    }
}
