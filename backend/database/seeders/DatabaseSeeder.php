<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Module;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Yagona namunaviy kurs yaratish
        $course = Course::create([
            'title' => 'Sanogen Tafakkur Asoslari',
            'description' => 'Biologiya o\'qituvchilari uchun sanogen tafakkurni rivojlantirish bo\'yicha maxsus kurs. Ushbu kurs orqali siz stressni boshqarish va o\'quvchilarga ijobiy yondashishni o\'rganasiz.',
            'image_url' => 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'
        ]);

        // Ushbu kurs uchun modullar (darslar) yaratish
        Module::create([
            'course_id' => $course->id,
            'title' => '1-dars: Sanogen tafakkur nima?',
            'content' => 'Sanogen tafakkur - bu muammolarni xotirjam tahlil qilib, salbiy hissiyotlarga berilmasdan, ijobiy yechim topish qobiliyatidir. Biologiya o\'qituvchisi sifatida tabiat va inson munosabatlarini tushunishda bu muhim ahamiyatga ega.',
            'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
            'order' => 1
        ]);

        Module::create([
            'course_id' => $course->id,
            'title' => '2-dars: Stressni boshqarish texnikasi',
            'content' => 'O\'quvchilar bilan ishlash ba\'zan stressli bo\'lishi mumkin. Ushbu darsda biz asab tizimimiz qanday ishlashini (biologik nuqtai nazardan) va stress gormonlarini (kortizol, adrenalin) qanday boshqarishni o\'rganamiz.',
            'video_url' => '', // No video
            'order' => 2
        ]);
        
        Module::create([
            'course_id' => $course->id,
            'title' => '3-dars: O\'quvchilar bilan ijobiy muloqot',
            'content' => 'Har bir o\'quvchining o\'zgaruvchan gormonal foni va o\'smirlik davridagi fiziologik o\'zgarishlari ularning xulq-atvoriga ta\'sir qiladi. Bunga sanogen yondashish - ularni tushunish va to\'g\'ri yo\'naltirish demakdir.',
            'video_url' => '',
            'order' => 3
        ]);
    }
}
