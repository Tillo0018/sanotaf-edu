<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });
        Schema::table('author_works', function (Blueprint $table) {
            $table->string('file_url')->nullable()->change();
        });
        Schema::table('project_infos', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->string('image_url')->nullable(false)->change();
        });
        Schema::table('author_works', function (Blueprint $table) {
            $table->string('file_url')->nullable(false)->change();
        });
        Schema::table('project_infos', function (Blueprint $table) {
            $table->string('image_url')->nullable(false)->change();
        });
    }
};
