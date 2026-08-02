<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class CertificateController extends Controller
{
    public function download(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $courseId = $request->query('course_id');
        if (!$courseId) {
            return response()->json(['status' => 'error', 'message' => 'Course ID kiritilmagan'], 400);
        }

        $course = \App\Models\Course::withCount('modules')->find($courseId);
        if (!$course) {
            return response()->json(['status' => 'error', 'message' => 'Kurs topilmadi'], 404);
        }

        // Check if user completed all modules for this course
        $completedModulesCount = UserProgress::where('user_id', $user->id)
            ->whereHas('module', function($query) use ($courseId) {
                $query->where('course_id', $courseId);
            })
            ->count();

        if ($course->modules_count == 0 || $completedModulesCount < $course->modules_count) {
            return response()->json(['status' => 'error', 'message' => 'Siz ushbu kursni to\'liq tugatmagansiz'], 403);
        }

        $totalScore = UserProgress::where('user_id', $user->id)
            ->whereHas('module', function($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })->sum('score');

        // Check if a certificate already exists
        $existingCert = \App\Models\GeneratedCertificate::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();
            
        if ($existingCert && \Illuminate\Support\Facades\Storage::disk('public')->exists($existingCert->file_path)) {
            return response()->download(storage_path('app/public/' . $existingCert->file_path), 'Sanotaf_Sertifikat_' . str_replace(' ', '_', $user->name) . '.pdf');
        }

        $latestProgress = UserProgress::where('user_id', $user->id)
            ->whereHas('module', function($query) use ($courseId) {
                $query->where('course_id', $courseId);
            })
            ->orderBy('completed_at', 'desc')->first();

        $date = $latestProgress && $latestProgress->completed_at 
            ? Carbon::parse($latestProgress->completed_at)->format('d.m.Y')
            : Carbon::now()->format('d.m.Y');

        $bgImagePath = public_path('images/cert_bg.jpg');
        $bgImage = file_exists($bgImagePath) ? base64_encode(file_get_contents($bgImagePath)) : '';

        // Generate QR code using QRServer API (JPEG format to avoid GD extension requirement)
        $verifyUrl = urlencode("http://sanotaf.edu/verify/" . $user->id . "?course_id=" . $courseId);
        $qrCodeBase64 = '';
        try {
            $qrCodeResponse = Http::timeout(10)->get("https://api.qrserver.com/v1/create-qr-code/?size=100x100&format=jpeg&data={$verifyUrl}");
            if ($qrCodeResponse->successful()) {
                $qrCodeBase64 = base64_encode($qrCodeResponse->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('QR Code generation failed: ' . $e->getMessage());
        }

        $data = [
            'name' => $user->name,
            'date' => $date,
            'score' => $totalScore,
            'bgImage' => $bgImage,
            'qrCode' => $qrCodeBase64,
            'courseTitle' => $course->title
        ];

        // Generate PDF
        $pdf = Pdf::loadView('certificate', $data)
                  ->setPaper('a4', 'landscape');

        // Save PDF to storage
        $fileName = 'certificate_' . $user->id . '_' . $courseId . '_' . time() . '.pdf';
        $filePath = 'certificates/' . $fileName;
        \Illuminate\Support\Facades\Storage::disk('public')->put($filePath, $pdf->output());
        
        \App\Models\GeneratedCertificate::create([
            'user_id' => $user->id,
            'course_id' => $courseId,
            'file_path' => $filePath
        ]);

        return response()->download(storage_path('app/public/' . $filePath), 'Sanotaf_Sertifikat_' . str_replace(' ', '_', $user->name) . '.pdf');
    }

    public function verify(Request $request, $id)
    {
        $user = \App\Models\User::find($id);
        
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Foydalanuvchi topilmadi'], 404);
        }

        $courseId = $request->query('course_id');
        
        if ($courseId) {
            // Course specific verification
            $course = \App\Models\Course::withCount('modules')->find($courseId);
            if (!$course) {
                return response()->json(['status' => 'error', 'message' => 'Kurs topilmadi'], 404);
            }
            
            $completedModulesCount = UserProgress::where('user_id', $user->id)
                ->whereHas('module', function($query) use ($courseId) {
                    $query->where('course_id', $courseId);
                })
                ->count();
                
            if ($course->modules_count == 0 || $completedModulesCount < $course->modules_count) {
                return response()->json(['status' => 'error', 'message' => 'Sertifikat haqiqiy emas (kurs to\'liq tugatilmagan)'], 404);
            }
            
            $totalScore = UserProgress::where('user_id', $user->id)
                ->whereHas('module', function($q) use ($courseId) {
                    $q->where('course_id', $courseId);
                })->sum('score');
                
            $latestProgress = UserProgress::where('user_id', $user->id)
                ->whereHas('module', function($query) use ($courseId) {
                    $query->where('course_id', $courseId);
                })
                ->orderBy('completed_at', 'desc')->first();
                
        } else {
            // Legacy verification (for old certificates)
            $totalScore = UserProgress::where('user_id', $user->id)->sum('score');

            $latestProgress = UserProgress::where('user_id', $user->id)->orderBy('completed_at', 'desc')->first();

        }

        $date = $latestProgress && $latestProgress->completed_at 
            ? Carbon::parse($latestProgress->completed_at)->format('d.m.Y')
            : Carbon::now()->format('d.m.Y');

        return response()->json([
            'status' => 'success',
            'user' => [
                'name' => $user->name,
            ],
            'score' => $totalScore,
            'date' => $date
        ]);
    }
}
