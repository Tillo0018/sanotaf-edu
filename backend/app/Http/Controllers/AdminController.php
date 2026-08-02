<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Question;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    // GET /api/admin/users
    public function users(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        $users = User::select('users.id', 'name', 'email', 'region', 'position', 'role', 'created_at', 'gender', 'school_location', 'pedagogical_experience', 'group')
            ->selectRaw('COALESCE((SELECT SUM(score) FROM user_progress WHERE user_progress.user_id = users.id), 0) as total_score')
            ->get();
        return response()->json(['status' => 'success', 'users' => $users]);
    }

    // GET /api/admin/users/{id}/progress
    public function userProgress(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        
        $user = User::find($id);
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Foydalanuvchi topilmadi'], 404);

        $courses = Course::withCount('modules')->get();
        $progress = [];

        foreach ($courses as $course) {
            $completedModules = UserProgress::with('module')->where('user_id', $id)
                ->whereHas('module', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })->get();
                
            $completedModulesCount = $completedModules->count();
            $score = $completedModules->sum('score');
            
            $status = 'Boshlamagan';
            if ($completedModulesCount > 0 && $completedModulesCount < $course->modules_count) {
                $status = 'Jarayonda';
            } elseif ($course->modules_count > 0 && $completedModulesCount === $course->modules_count) {
                $status = 'Tugallangan';
            }

            $progress[] = [
                'course' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'total_modules' => $course->modules_count,
                ],
                'completed_modules_count' => $completedModulesCount,
                'score' => $score,
                'status' => $status,
                'details' => $completedModules->map(function($up) {
                    return [
                        'module_title' => $up->module ? $up->module->title : 'Noma\'lum modul',
                        'score' => $up->score,
                        'completed_at' => $up->completed_at
                    ];
                })
            ];
        }

        return response()->json(['status' => 'success', 'progress' => $progress]);
    }

    // GET /api/admin/analytics
    public function analytics(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);

        $totalUsers = User::count();
        $totalCourses = Course::count();
        $totalTestsCompleted = UserProgress::count();
        $averageScore = UserProgress::avg('score') ?? 0;

        $regionalPerformance = User::select('users.region as region')
            ->leftJoin('user_progress', 'users.id', '=', 'user_progress.user_id')
            ->selectRaw('COUNT(DISTINCT users.id) as users_count')
            ->selectRaw('COALESCE(AVG(user_progress.score), 0) as avg_score')
            ->groupBy('users.region')
            ->get();

        $mostActiveUsers = User::select('users.id', 'name', 'region')
            ->selectRaw('(SELECT COUNT(*) FROM user_progress WHERE user_progress.user_id = users.id) as tests_completed')
            ->selectRaw('COALESCE((SELECT SUM(score) FROM user_progress WHERE user_progress.user_id = users.id), 0) as total_score')
            ->orderByDesc('tests_completed')
            ->limit(10)
            ->get();

        $recentHistory = UserProgress::with(['user:id,name,region', 'module:id,title,course_id', 'module.course:id,title'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'status' => 'success',
            'analytics' => [
                'total_users' => $totalUsers,
                'total_courses' => $totalCourses,
                'total_tests_completed' => $totalTestsCompleted,
                'average_score' => round($averageScore, 2),
                'regional_performance' => $regionalPerformance,
                'most_active_users' => $mostActiveUsers,
                'recent_history' => $recentHistory,
            ]
        ]);
    }

    // POST /api/admin/upload-course-image
    public function uploadCourseImage(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);

        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('courses', $filename, 'public');

        // Faqat nisbiy manzilni saqlaymiz
        $url = '/storage/courses/' . $filename;

        return response()->json(['status' => 'success', 'image_url' => $url]);
    }

    // POST /api/admin/courses
    public function storeCourse(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        
        $course = Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $request->image_url ?? '',
        ]);
        
        return response()->json(['status' => 'success', 'course' => $course]);
    }

    // POST /api/admin/modules
    public function storeModule(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        
        $module = Module::create([
            'course_id' => $request->course_id,
            'title' => $request->title,
            'content' => $request->input('content'),
            'video_url' => $request->video_url ?? '',
            'presentation_url' => $request->presentation_url ?? '',
            'order' => $request->order ?? 1,
        ]);
        
        return response()->json(['status' => 'success', 'module' => $module]);
    }

    // POST /api/admin/modules/{id}/upload-presentation
    public function uploadPresentation(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);

        $request->validate([
            'file' => 'required|file|mimes:pdf,ppt,pptx,odp|max:51200', // 50MB max
        ]);

        $module = Module::findOrFail($id);

        // Delete old file if it was previously uploaded locally
        if ($module->presentation_url && str_contains($module->presentation_url, '/storage/presentations/')) {
            $oldPath = str_replace('/storage/', 'public/', parse_url($module->presentation_url, PHP_URL_PATH));
            Storage::delete($oldPath);
        }

        $file = $request->file('file');
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('presentations', $filename, 'public');

        // Faqat nisbiy manzilni saqlaymiz
        $url = '/storage/presentations/' . $filename;

        $module->update(['presentation_url' => $url]);

        return response()->json(['status' => 'success', 'presentation_url' => url($url), 'module' => $module]);
    }

    // POST /api/admin/questions
    public function storeQuestion(Request $request)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);

        $question = Question::create([
            'module_id' => $request->module_id,
            'question_text' => $request->question_text,
            'options' => $request->options ?? [],
            'type' => $request->input('type', 'multiple_choice'),
            'ai_rubric' => $request->input('ai_rubric'),
            'video_timestamp' => $request->input('video_timestamp'),
        ]);

        return response()->json(['status' => 'success', 'question' => $question]);
    }

    // PUT /api/admin/courses/{id}
    public function updateCourse(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        $course = Course::findOrFail($id);
        $course->update([
            'title' => $request->title ?? $course->title,
            'description' => $request->description ?? $course->description,
            'image_url' => $request->image_url ?? $course->image_url,
        ]);
        return response()->json(['status' => 'success', 'course' => $course]);
    }

    // DELETE /api/admin/courses/{id}
    public function destroyCourse(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        Course::destroy($id);
        return response()->json(['status' => 'success']);
    }

    // PUT /api/admin/modules/{id}
    public function updateModule(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        $module = Module::findOrFail($id);
        $module->update([
            'title' => $request->title ?? $module->title,
            'content' => $request->input('content', $module->content),
            'video_url' => $request->input('video_url', $module->video_url),
            'presentation_url' => $request->input('presentation_url', $module->presentation_url),
            'order' => $request->order ?? $module->order,
        ]);
        return response()->json(['status' => 'success', 'module' => $module]);
    }

    // DELETE /api/admin/modules/{id}
    public function destroyModule(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        Module::destroy($id);
        return response()->json(['status' => 'success']);
    }

    // PUT /api/admin/questions/{id}
    public function updateQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        $question = Question::findOrFail($id);
        $question->update([
            'question_text' => $request->question_text ?? $question->question_text,
            'options' => $request->options ?? $question->options,
            'type' => $request->input('type', $question->type),
            'ai_rubric' => $request->input('ai_rubric', $question->ai_rubric),
            'video_timestamp' => $request->input('video_timestamp', $question->video_timestamp),
        ]);
        return response()->json(['status' => 'success', 'question' => $question]);
    }

    // DELETE /api/admin/questions/{id}
    public function destroyQuestion(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['status' => 'error'], 403);
        Question::destroy($id);
        return response()->json(['status' => 'success']);
    }
}
