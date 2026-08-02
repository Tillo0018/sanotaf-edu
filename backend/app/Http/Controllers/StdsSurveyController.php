<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StdsSurvey;
use App\Models\Module;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class StdsSurveyController extends Controller
{
    private $questions = [
        ['id' => 1, 'text' => "Darsda xato qilganimda, sabablarni chuqur tahlil qilib, keyingi dars uchun ijobiy xulosa chiqaraman.", 'subscale' => 'reflexive', 'reverse' => false],
        ['id' => 2, 'text' => "Yangi raqamli platformani o'rganishda qiynalsam, o'zimni noqodir va qoloq deb his qilaman.", 'subscale' => 'cognitive', 'reverse' => true],
        ['id' => 3, 'text' => "O'quvchilar mavzuni tushunmagan vaqtda, avvalo o'z dars o'tish metodimni qayta ko'rib chiqaman.", 'subscale' => 'constructive', 'reverse' => false],
        ['id' => 4, 'text' => "Malaka oshirish kursiga borish va yangiliklarni o'rganish menga ortiqcha yukdek tuyuladi.", 'subscale' => 'motivational', 'reverse' => true],
        ['id' => 5, 'text' => "Biologiyaga oid internet axborotlarini tanqidiy baholab, faqat ilmiy asoslilarini saralab qo'llayman.", 'subscale' => 'cognitive', 'reverse' => false],
        ['id' => 6, 'text' => "Stressli pedagogik vaziyatda hissiyotlarga berilmay, o'zimni tezda tinchlantira olaman.", 'subscale' => 'emotional', 'reverse' => false],
        ['id' => 7, 'text' => "Hamkasbim mendan yaxshiroq dars o'tkazganini ko'rsam, hasad emas, undan o'rganadigan narsa izlayman.", 'subscale' => 'reflexive', 'reverse' => false],
        ['id' => 8, 'text' => "Raqamli vositalar (proyektor, kompyuter) ishlamay qolsa, o'zimni halokatga tushgandek his qilaman.", 'subscale' => 'cognitive', 'reverse' => true],
        ['id' => 9, 'text' => "Biologiya darsimda o'quvchilarning kutilmagan savollari meni bezovta qilmaydi, aksincha ilhomlantiradi.", 'subscale' => 'constructive', 'reverse' => false],
        ['id' => 10, 'text' => "Xato qilganimda, buni 'men yomon o'qituvchiman' degan dalil sifatida fojiali qabul qilaman.", 'subscale' => 'emotional', 'reverse' => true],
        ['id' => 11, 'text' => "Dars o'tishda doim bir xil an'anaviy usuldan foydalanishni ma'qul ko'raman, o'zgarishlarni yoqtirmayman.", 'subscale' => 'reflexive', 'reverse' => true],
        ['id' => 12, 'text' => "O'quvchilarning test natijalari past bo'lsa, aybni ularga to'nkamasdan, avvalo o'z metodikamni tahlil qilaman.", 'subscale' => 'reflexive', 'reverse' => false],
        ['id' => 13, 'text' => "Hamkasblarimning tanqidini shaxsiyatimga hujum emas, kasbiy o'sishim uchun imkoniyat deb bilaman.", 'subscale' => 'reflexive', 'reverse' => false],
        ['id' => 14, 'text' => "O'z ustimda ishlash uchun darsdan keyin 'Refleksiya kundaligi' yuritishni ortiqcha vaqt sarfi deb bilaman.", 'subscale' => 'reflexive', 'reverse' => true],
        ['id' => 15, 'text' => "Biologiya ta'limiga 3D va VR texnologiyalari kirib kelayotganini ko'rib, o'z kasbimni yo'qotishdan qo'rqaman.", 'subscale' => 'cognitive', 'reverse' => true],
        ['id' => 16, 'text' => "Yangi ta'lim platformasini bir marta ko'rib tushunmasam, uni o'rganishni asabiylashib tashlab qo'yaman.", 'subscale' => 'cognitive', 'reverse' => true],
        ['id' => 17, 'text' => "Raqamli platformalar qanchalik murakkab bo'lmasin, ularni bosqichma-bosqich o'zlashtira olishimga ishonaman.", 'subscale' => 'cognitive', 'reverse' => false],
        ['id' => 18, 'text' => "Darsda texnik nosozlik yuz bersa, vahimaga tushmasdan zudlik bilan zaxira (B plan) rejamni ishga solaman.", 'subscale' => 'constructive', 'reverse' => false],
        ['id' => 19, 'text' => "Maktabdagi kamchiliklarni nolishdan ko'ra, shaxsan o'zim o'zgartira oladigan jihatlarga e'tibor qarataman.", 'subscale' => 'constructive', 'reverse' => false],
        ['id' => 20, 'text' => "Qiyin ta'limiy vaziyatga tushib qolsam, yechim qidirish o'rniga rahbariyat yoki sharoitni ayblashga moyilman.", 'subscale' => 'constructive', 'reverse' => true],
        ['id' => 21, 'text' => "Zamonaviy biologik tajribalarni virtual laboratoriyalarda qanday o'tkazishni hamkasblarim bilan faol muhokama qilaman.", 'subscale' => 'constructive', 'reverse' => false],
        ['id' => 22, 'text' => "Malaka oshirish kurslaridagi yangi bilimlarni dars jarayonimga tatbiq etish imkoniyati meni ilhomlantiradi.", 'subscale' => 'motivational', 'reverse' => false],
        ['id' => 23, 'text' => "Faqat rahbariyat majbur qilgani yoki sertifikat uchungina malaka oshirish kurslariga qatnashaman.", 'subscale' => 'motivational', 'reverse' => true],
        ['id' => 24, 'text' => "Kasbiy qiyinchiliklar meni tushkunlikka tushirmaydi, aksincha, o'z ustimda ko'proq ishlashga undaydi (chaqiriq).", 'subscale' => 'motivational', 'reverse' => false],
        ['id' => 25, 'text' => "O'qituvchilik kasbida ko'p yillik tajribam bor, endi o'rganadigan hech narsa qolmadi, deb hisoblayman.", 'subscale' => 'motivational', 'reverse' => true],
        ['id' => 26, 'text' => "Biologiya fanidagi so'nggi yangiliklar va raqamli resurslarni mustaqil ravishda izlab topishdan zavqlanaman.", 'subscale' => 'motivational', 'reverse' => false],
        ['id' => 27, 'text' => "O'quvchilar darsni tushunmay, shovqin qilsa, o'zimni tuta olmay, ularga qattiq ovozda asabiylashaman.", 'subscale' => 'emotional', 'reverse' => true],
        ['id' => 28, 'text' => "Kasbiy charchoq (burnout) his qilganimda, ish va dam olish rejimini qayta ko'rib chiqib, o'zimni tezda tiklay olaman.", 'subscale' => 'emotional', 'reverse' => false],
        ['id' => 29, 'text' => "Atrofdagilarning kayfiyati yomon bo'lsa, bu narsa mening dars o'tish sifatimga va ruhiyatimga darhol salbiy ta'sir qiladi.", 'subscale' => 'emotional', 'reverse' => true],
        ['id' => 30, 'text' => "Dars jarayonidagi muvaffaqiyatsizliklarni fojia emas, balki oddiy ish jarayoni va qimmatli tajriba sifatida xotirjam qabul qilaman.", 'subscale' => 'emotional', 'reverse' => false],
    ];

    public function status()
    {
        $userId = Auth::id();

        $hasPre = StdsSurvey::where('user_id', $userId)->where('type', 'pre')->exists();
        $hasPost = StdsSurvey::where('user_id', $userId)->where('type', 'post')->exists();

        // Check course completion
        $totalModules = Module::count();
        $completedModules = UserProgress::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->count();

        $isCourseCompleted = ($totalModules > 0 && $completedModules >= $totalModules);

        return response()->json([
            'status' => 'success',
            'data' => [
                'has_pre' => $hasPre,
                'has_post' => $hasPost,
                'is_course_completed' => $isCourseCompleted,
                'total_modules' => $totalModules,
                'completed_modules' => $completedModules,
            ]
        ]);
    }

    public function questions()
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->questions
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'type' => 'required|in:pre,post',
            'answers' => 'required|array', // key is question id, value is 1-5
        ]);

        $userId = Auth::id();
        $type = $request->type;
        $answers = $request->answers;

        // Ensure user hasn't already submitted this type
        $exists = StdsSurvey::where('user_id', $userId)->where('type', $type)->exists();
        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Siz bu so\'rovnomani allaqachon to\'ldirgansiz.'], 400);
        }

        // If post, ensure course is finished
        if ($type === 'post') {
            $totalModules = Module::count();
            $completedModules = UserProgress::where('user_id', $userId)->whereNotNull('completed_at')->count();
            if ($totalModules == 0 || $completedModules < $totalModules) {
                return response()->json(['status' => 'error', 'message' => 'Avval kursni tugating.'], 403);
            }
        }

        // Calculate scores
        $subscales = [
            'reflexive' => ['sum' => 0, 'count' => 0],
            'cognitive' => ['sum' => 0, 'count' => 0],
            'constructive' => ['sum' => 0, 'count' => 0],
            'motivational' => ['sum' => 0, 'count' => 0],
            'emotional' => ['sum' => 0, 'count' => 0],
        ];
        
        $totalSum = 0;
        $totalCount = 0;

        foreach ($this->questions as $q) {
            $qId = $q['id'];
            if (!isset($answers[$qId])) {
                return response()->json(['status' => 'error', 'message' => 'Barcha savollarga javob berish majburiy.'], 400);
            }

            $rawVal = (int) $answers[$qId];
            if ($rawVal < 1 || $rawVal > 5) {
                return response()->json(['status' => 'error', 'message' => 'Noto\'g\'ri baho qiymati.'], 400);
            }

            // Reverse logic: (1->5, 2->4, 3->3, 4->2, 5->1) => 6 - val
            $finalVal = $q['reverse'] ? (6 - $rawVal) : $rawVal;

            $sub = $q['subscale'];
            $subscales[$sub]['sum'] += $finalVal;
            $subscales[$sub]['count']++;

            $totalSum += $finalVal;
            $totalCount++;
        }

        // Calculate averages
        $scoreReflexive = $subscales['reflexive']['sum'] / $subscales['reflexive']['count'];
        $scoreCognitive = $subscales['cognitive']['sum'] / $subscales['cognitive']['count'];
        $scoreConstructive = $subscales['constructive']['sum'] / $subscales['constructive']['count'];
        $scoreMotivational = $subscales['motivational']['sum'] / $subscales['motivational']['count'];
        $scoreEmotional = $subscales['emotional']['sum'] / $subscales['emotional']['count'];
        $totalScore = $totalSum / $totalCount;

        $survey = StdsSurvey::create([
            'user_id' => $userId,
            'type' => $type,
            'answers' => $answers,
            'score_reflexive' => $scoreReflexive,
            'score_cognitive' => $scoreCognitive,
            'score_constructive' => $scoreConstructive,
            'score_motivational' => $scoreMotivational,
            'score_emotional' => $scoreEmotional,
            'total_score' => $totalScore
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Natijalar saqlandi.',
            'data' => $survey
        ]);
    }

    public function myResults()
    {
        $userId = Auth::id();
        $pre = StdsSurvey::where('user_id', $userId)->where('type', 'pre')->first();
        $post = StdsSurvey::where('user_id', $userId)->where('type', 'post')->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pre' => $pre,
                'post' => $post
            ]
        ]);
    }
}
