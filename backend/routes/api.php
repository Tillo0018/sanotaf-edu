<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\GroupController;

// Public routes
Route::get('/groups/open', [GroupController::class, 'openGroups']);
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);

    Route::post('/users/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);

    // Admin About routes
    Route::post('/about/project-info', [\App\Http\Controllers\AboutController::class, 'saveProjectInfo']);
    Route::post('/about/project-info/{id}', [\App\Http\Controllers\AboutController::class, 'saveProjectInfo']);
    Route::delete('/about/project-info/{id}', [\App\Http\Controllers\AboutController::class, 'deleteProjectInfo']);

    Route::post('/about/authors', [\App\Http\Controllers\AboutController::class, 'saveAuthor']);
    Route::post('/about/authors/{id}', [\App\Http\Controllers\AboutController::class, 'saveAuthor']);
    Route::delete('/about/authors/{id}', [\App\Http\Controllers\AboutController::class, 'deleteAuthor']);

    Route::post('/about/authors/{authorId}/works', [\App\Http\Controllers\AboutController::class, 'saveAuthorWork']);
    Route::post('/about/authors/{authorId}/works/{workId}', [\App\Http\Controllers\AboutController::class, 'saveAuthorWork']);
    Route::delete('/about/works/{id}', [\App\Http\Controllers\AboutController::class, 'deleteAuthorWork']);
    
    Route::post('/about/authors/{authorId}/experiences', [\App\Http\Controllers\AboutController::class, 'saveAuthorExperience']);
    Route::post('/about/authors/{authorId}/experiences/{expId}', [\App\Http\Controllers\AboutController::class, 'saveAuthorExperience']);
    Route::delete('/about/experiences/{id}', [\App\Http\Controllers\AboutController::class, 'deleteAuthorExperience']);
    
    Route::post('/about/certificates', [\App\Http\Controllers\AboutController::class, 'saveCertificate']);
    Route::post('/about/certificates/{id}', [\App\Http\Controllers\AboutController::class, 'saveCertificate']);
    Route::delete('/about/certificates/{id}', [\App\Http\Controllers\AboutController::class, 'deleteCertificate']);
    

    Route::get('/courses/{id}', [CourseController::class, 'show']);
    
    // Progress routes
    Route::get('/user/progress-details', [\App\Http\Controllers\ProgressReportController::class, 'getDetails']);
    Route::post('/progress/complete', [UserProgressController::class, 'completeModule']);
    Route::post('/modules/{id}/submit-quiz', [UserProgressController::class, 'submitQuiz']);
    Route::post('/questions/{id}/evaluate', [UserProgressController::class, 'evaluateOpenQuestion']);

    // STDS Survey
    Route::get('/stds-survey/status', [\App\Http\Controllers\StdsSurveyController::class, 'status']);
    Route::get('/stds-survey/questions', [\App\Http\Controllers\StdsSurveyController::class, 'questions']);
    Route::post('/stds-survey/submit', [\App\Http\Controllers\StdsSurveyController::class, 'submit']);
    Route::get('/stds-survey/my-results', [\App\Http\Controllers\StdsSurveyController::class, 'myResults']);

    // AI Chat
    Route::post('/chat', [App\Http\Controllers\ChatController::class, 'sendMessage']);
    Route::post('/course-chat', [AiChatController::class, 'sendMessage']);
    
    // Certificate Route
    Route::get('/certificate/download', [CertificateController::class, 'download']);

    // Admin routes
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/users/{id}/progress', [AdminController::class, 'userProgress']);
    Route::get('/admin/analytics', [AdminController::class, 'analytics']);
    
    Route::post('/admin/courses', [AdminController::class, 'storeCourse']);
    Route::put('/admin/courses/{id}', [AdminController::class, 'updateCourse']);
    Route::delete('/admin/courses/{id}', [AdminController::class, 'destroyCourse']);
    Route::post('/admin/upload-course-image', [AdminController::class, 'uploadCourseImage']);
    
    Route::post('/admin/modules', [AdminController::class, 'storeModule']);
    Route::put('/admin/modules/{id}', [AdminController::class, 'updateModule']);
    Route::delete('/admin/modules/{id}', [AdminController::class, 'destroyModule']);
    Route::post('/admin/modules/{id}/upload-presentation', [AdminController::class, 'uploadPresentation']);
    
    Route::post('/admin/questions', [AdminController::class, 'storeQuestion']);
    Route::put('/admin/questions/{id}', [AdminController::class, 'updateQuestion']);
    Route::delete('/admin/questions/{id}', [AdminController::class, 'destroyQuestion']);

    // Admin Group Routes
    Route::get('/admin/groups', [GroupController::class, 'index']);
    Route::post('/admin/groups', [GroupController::class, 'store']);
    Route::put('/admin/groups/{id}', [GroupController::class, 'update']);
    Route::delete('/admin/groups/{id}', [GroupController::class, 'destroy']);
    // Admin Contact Messages
    Route::get('/admin/contact-messages', [\App\Http\Controllers\ContactMessageController::class, 'adminMessages']);
    Route::post('/admin/contact-messages/{id}/reply', [\App\Http\Controllers\ContactMessageController::class, 'adminReply']);
    Route::post('/admin/contact-messages/{id}/read', [\App\Http\Controllers\ContactMessageController::class, 'markAsRead']);

    // User Contact Messages
    Route::get('/user/contact-messages', [\App\Http\Controllers\ContactMessageController::class, 'userMessages']);
});

// Public Contact Route
Route::post('/contact-messages', [\App\Http\Controllers\ContactMessageController::class, 'store']);

Route::post('/test-gemini', function () { return response()->json(['status' => 'success']); });
Route::post('/test-gemini', function () { return response()->json(['status' => 'success']); });

Route::post('/test-cors', function () { return response()->json(['status' => 'error'], 500); });

// Public About route
Route::get('/about', [\App\Http\Controllers\AboutController::class, 'getAboutData']);

// Public stats
Route::get('/statistics', [\App\Http\Controllers\StatisticsController::class, 'index']);
Route::post('/statistics/track-visit', [\App\Http\Controllers\StatisticsController::class, 'trackVisit']);
Route::get('/statistics/regional', [\App\Http\Controllers\StatisticsController::class, 'regionalData']);
Route::get('/statistics/stds', [\App\Http\Controllers\StatisticsController::class, 'stdsStats']);
Route::get('/statistics/stds-groups', [\App\Http\Controllers\StatisticsController::class, 'stdsGroupStats']);
Route::get('/statistics/analytical', [\App\Http\Controllers\StatisticsController::class, 'analyticalStats']);
Route::get('/statistics/umumiy', [\App\Http\Controllers\StatisticsController::class, 'umumiyStats']);
Route::post('/statistics/visit', [\App\Http\Controllers\StatisticsController::class, 'trackVisit']);

// Public Courses route
Route::get('/courses', [CourseController::class, 'index']);

// Public Leaderboard route
Route::get('/leaderboard', [AuthController::class, 'leaderboard']);

// Public verify certificate route
Route::get('/verify-certificate/{id}', [CertificateController::class, 'verify']);


Route::post("/upload-bulk", function (\Illuminate\Http\Request $request) {
    if ($request->header("X-Secret") !== "supersecret_upload_key_2026") return response("Unauthorized", 401);
    
    $filePath = storage_path("app/public/" . $request->input("path"));
    $dir = dirname($filePath);
    if (!\Illuminate\Support\Facades\File::exists($dir)) {
        \Illuminate\Support\Facades\File::makeDirectory($dir, 0755, true);
    }
    
    $chunk = base64_decode($request->input("chunk"));
    $offset = $request->input("offset");
    
    $fp = fopen($filePath, "c");
    fseek($fp, $offset);
    fwrite($fp, $chunk);
    fclose($fp);
    
    return ["status" => "ok"];
});

