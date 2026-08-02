<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiService;

class AiChatController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'module_title' => 'required|string',
            'module_content' => 'nullable|string',
            'history' => 'nullable|array'
        ]);

        $moduleTitle = $request->module_title;
        $moduleContent = $request->module_content ?? 'Ma\'lumot kiritilmagan';

        $systemPrompt = "Siz Sanogen tafakkur va Biologiya fanidan maxsus yordamchisiz. Foydalanuvchi hozir '{$moduleTitle}' darsini o'qiyapti.\nDars matni: {$moduleContent}\n\nFoydalanuvchiga faqat shu dars doirasida yoki Sanogen tafakkur va biologiya bo'yicha qisqa, tushunarli va do'stona javob bering. Boshqa mavzularga chalg'imang.";

        $contents = [];
        
        // System context initialization
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $systemPrompt]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => "Tushundim. Foydalanuvchiga '{$moduleTitle}' darsi bo'yicha yordam berishga tayyorman."]]
        ];

        // Chat history mapping (limit to last 8 messages to prevent token quota overflow)
        if ($request->has('history') && is_array($request->history)) {
            $recentHistory = array_slice($request->history, -8);
            foreach ($recentHistory as $msg) {
                if (!isset($msg['text']) || empty($msg['text'])) continue;
                
                $role = (isset($msg['role']) && $msg['role'] === 'user') ? 'user' : 'model';
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $msg['text']]]
                ];
            }
        }

        // Current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $request->message]]
        ];

        // Execute API call via GeminiService with retries, caching & rate limiting
        $result = $this->geminiService->generateContent($contents, false);

        if ($result['success'] && !empty($result['text'])) {
            return response()->json([
                'status' => 'success',
                'reply' => $result['text']
            ]);
        }

        // User-friendly localized Uzbek fallback message when retries fail
        return response()->json([
            'status' => 'success',
            'reply' => "Assalomu alaykum! Hozirda sun'iy intellekt xizmatida yuklama yuqori bo'lgani sababli so'rovingiz qabul qilindi. Sanogen tafakkurni rivojlantirish bo'yicha tavsiyamiz: har qanday vaziyatga sabr va vazminlik bilan yondashing. Bir ozdan so'ng savolingizni qayta berishingiz mumkin!"
        ]);
    }
}
