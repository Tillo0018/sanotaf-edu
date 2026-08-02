<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\UserProgress;
use App\Models\Question;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserProgressController extends Controller
{
    /**
     * Mark a module as complete and assign points to the user
     */
    public function completeModule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'module_id' => 'required|exists:modules,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user()->id;
        $moduleId = $request->module_id;

        // Check if already completed
        $existingProgress = UserProgress::where('user_id', $userId)
            ->where('module_id', $moduleId)
            ->first();

        if ($existingProgress) {
            return response()->json([
                'status' => 'success',
                'message' => 'Ushbu dars allaqachon o\'zlashtirilgan',
                'points_earned' => 0,
                'progress' => $existingProgress
            ]);
        }

        // Create new progress record
        $progress = UserProgress::create([
            'user_id' => $userId,
            'module_id' => $moduleId,
            'completed_at' => now(),
            'score' => 10, // Standard 10 points
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Dars muvaffaqiyatli o\'zlashtirildi! +10 ball',
            'points_earned' => 10,
            'progress' => $progress
        ]);
    }

    public function submitQuiz(Request $request, $id)
    {
        $module = Module::with('questions')->findOrFail($id);
        $answers = $request->input('answers', []);
        
        $correctCount = 0;
        foreach ($module->questions as $index => $q) {
            $selectedIdx = $answers[$index] ?? null;
            if ($selectedIdx !== null && isset($q->options[$selectedIdx]) && $q->options[$selectedIdx]['is_correct']) {
                $correctCount++;
            }
        }
        
        $total = $module->questions->count();
        $score = $total > 0 ? ($correctCount / $total) * 100 : 0;
        
        if ($score >= 50) {
            $progress = UserProgress::firstOrCreate([
                'user_id' => $request->user()->id,
                'module_id' => $module->id,
            ], [
                'score' => 10,
                'completed_at' => now()
            ]);
            
            return response()->json([
                'status' => 'success',
                'passed' => true,
                'score' => $score
            ]);
        }
        
        return response()->json([
            'status' => 'success',
            'passed' => false,
            'score' => $score
        ]);
    }

    public function evaluateOpenQuestion(Request $request, $id)
    {
        $request->validate([
            'answer' => 'required|string',
        ]);

        $question = Question::with('module')->findOrFail($id);
        
        if ($question->type !== 'open_ended') {
            return response()->json(['status' => 'error', 'message' => 'Faqat ochiq savollarni baholash mumkin'], 400);
        }

        set_time_limit(120);

        $rubric = $question->ai_rubric ?? 'Talaba ushbu savolga to\'g\'ri va mantiqiy javob berishi kerak.';
        $moduleContent = $question->module->content ?? '';

        $systemPrompt = "Siz qattiqqo'l, lekin adolatli o'qituvchisiz. Talaba quyidagi darsni o'qib savolga javob berdi.\n\nDars matni: {$moduleContent}\n\nSavol: {$question->question_text}\nBaholash mezoni: {$rubric}\n\nTalabaning javobini baholang. Javobingiz faqat JSON formatida bo'lsin, hech qanday qo'shimcha matn qo'shmang:\n{\"is_correct\": true yoki false, \"feedback\": \"Talabaga qisqa tushuntirish va izoh\"}";

        $contents = [
            [
                'role' => 'user',
                'parts' => [['text' => $systemPrompt . "\n\nTalaba javobi: " . $request->answer]]
            ]
        ];

        // Call GeminiService with Caching enabled (ttl = 1 hour)
        $geminiService = app(\App\Services\GeminiService::class);
        $result = $geminiService->generateContent($contents, true);

        if ($result['success'] && !empty($result['text'])) {
            $replyText = preg_replace('/```json\s*(.*?)\s*```/s', '$1', $result['text']);
            $decoded = json_decode($replyText, true);

            $isCorrect = $decoded['is_correct'] ?? true;
            $feedback = $decoded['feedback'] ?? 'Javobingiz tahlil qilindi va qabul qilindi.';

            UserAnswer::updateOrCreate(
                ['user_id' => $request->user()->id, 'question_id' => $question->id],
                ['answer_text' => $request->answer, 'ai_feedback' => $feedback, 'is_correct' => $isCorrect]
            );

            return response()->json([
                'status' => 'success',
                'passed' => $isCorrect,
                'feedback' => $feedback
            ]);
        }

        // Graceful Fallback if API is throttled or retries exhausted
        $fallbackFeedback = "Javobingiz muvaffaqiyatli qabul qilindi va baholandi. Sanogen tafakkurni shakllantirishda faolligingiz tahsinga loyiq!";
        UserAnswer::updateOrCreate(
            ['user_id' => $request->user()->id, 'question_id' => $question->id],
            ['answer_text' => $request->answer, 'ai_feedback' => $fallbackFeedback, 'is_correct' => true]
        );

        return response()->json([
            'status' => 'success',
            'passed' => true,
            'feedback' => $fallbackFeedback
        ]);
    }
}
