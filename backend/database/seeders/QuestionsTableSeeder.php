<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Question;

class QuestionsTableSeeder extends Seeder
{
    public function run(): void
    {
        $modules = Module::all();

        foreach ($modules as $module) {
            if ($module->order === 1) {
                // Add questions to the first module
                Question::create([
                    'module_id' => $module->id,
                    'question_text' => 'Sanogen tafakkur nima?',
                    'options' => [
                        ['text' => 'Sog\'lomlashtiruvchi, muammoni hal qilishga qaratilgan fikrlash', 'is_correct' => true],
                        ['text' => 'Kasallikka olib keluvchi fikrlash', 'is_correct' => false],
                        ['text' => 'Faqatgina o\'zini o\'ylash', 'is_correct' => false],
                        ['text' => 'Birovni ayblashga asoslangan fikrlash', 'is_correct' => false],
                    ],
                ]);

                Question::create([
                    'module_id' => $module->id,
                    'question_text' => 'Patogen tafakkurning belgisi nimada?',
                    'options' => [
                        ['text' => 'O\'z xatolaridan saboq olish', 'is_correct' => false],
                        ['text' => 'Stress holatida vahimaga tushib, boshqalarni ayblash', 'is_correct' => true],
                        ['text' => 'Doimiy ravishda kitob o\'qish', 'is_correct' => false],
                        ['text' => 'Muammoni tezda tahlil qilish', 'is_correct' => false],
                    ],
                ]);
            } elseif ($module->order === 2) {
                Question::create([
                    'module_id' => $module->id,
                    'question_text' => 'Ruhiy salomatlikni saqlashda qaysi usul eng samarali?',
                    'options' => [
                        ['text' => 'Doimo o\'zini tanqid qilish', 'is_correct' => false],
                        ['text' => 'Muammoni qabul qilib, uni hal qilish yo\'lini izlash', 'is_correct' => true],
                        ['text' => 'Barchasiga beparvo bo\'lish', 'is_correct' => false],
                        ['text' => 'Faqat uxlash orqali', 'is_correct' => false],
                    ],
                ]);
            } else {
                // Add default questions for other modules
                Question::create([
                    'module_id' => $module->id,
                    'question_text' => 'Bu darsdan olingan asosiy xulosa qaysi?',
                    'options' => [
                        ['text' => 'Sog\'lom fikrlash tanamizga ham ijobiy ta\'sir qiladi', 'is_correct' => true],
                        ['text' => 'Fikrlash muhim emas', 'is_correct' => false],
                        ['text' => 'Stress har doim foydali', 'is_correct' => false],
                        ['text' => 'Inson o\'zgarishi mumkin emas', 'is_correct' => false],
                    ],
                ]);
            }
        }
    }
}
