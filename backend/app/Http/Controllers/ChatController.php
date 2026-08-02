<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array' // For context of previous messages
        ]);

        $userMessage = $request->message;
        $apiKey = env('GEMINI_API_KEY', '');

        // If no API key is provided, return a simulated mock response
        if (empty($apiKey)) {
            // Simulate a delay
            sleep(1);
            return response()->json([
                'status' => 'success',
                'reply' => "Bu Gemini API ning simulyatsiya qilingan javobi. Sizning xabaringiz: \"{$userMessage}\". Haqiqiy AI ga aylantirish uchun backenddagi `.env` fayliga `GEMINI_API_KEY` ni qo'shing va menga xabar bering!",
                'is_mock' => true
            ]);
        }

        // Real Gemini API Call
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}";

        // Prepare the payload for Gemini
        // We inject a system prompt at the beginning of the context
        $contents = [];
        
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => "Sen biologiya o'qituvchilariga 'Sanogen tafakkur' (sog'lom, ijobiy, muammolarni hal qiluvchi tafakkur) ni rivojlantirishda yordam beruvchi virtual psixolog va pedogogik maslahatchisan. O'zbek tilida, muloyim va tushunarli javob ber. O'qituvchining xabariga sanogen yondashuv bilan javob qaytar."]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => "Assalomu alaykum! Tushundim, men biologiya o'qituvchilarining sanogen tafakkurini rivojlantirishga yordam berishga tayyorman. Qanday muammo yoki vaziyat haqida suhbatlashamiz?"]]
        ];

        // Append conversation history if provided
        if ($request->has('history') && is_array($request->history)) {
            foreach ($request->history as $msg) {
                // Ensure correct roles for Gemini: 'user' or 'model'
                $role = $msg['role'] === 'user' ? 'user' : 'model';
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $msg['content']]]
                ];
            }
        }

        // Append the current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        try {
            $response = Http::post($url, [
                'contents' => $contents
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "Kechirasiz, AI dan javob olishda xatolik yuz berdi.";
                
                return response()->json([
                    'status' => 'success',
                    'reply' => $reply,
                    'is_mock' => false
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gemini API bilan bog\'lanishda xatolik: ' . $response->body()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tizim xatoligi: ' . $e->getMessage()
            ], 500);
        }
    }
}
