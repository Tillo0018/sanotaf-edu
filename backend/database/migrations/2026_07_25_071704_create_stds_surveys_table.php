<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stds_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['pre', 'post']);
            $table->json('answers');
            $table->float('score_reflexive')->default(0);
            $table->float('score_cognitive')->default(0);
            $table->float('score_constructive')->default(0);
            $table->float('score_motivational')->default(0);
            $table->float('score_emotional')->default(0);
            $table->float('total_score')->default(0);
            $table->timestamps();

            // A user can only have one pre and one post test
            $table->unique(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stds_surveys');
    }
};
