<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/run-migrations', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return 'Migrations completed successfully: ' . \Illuminate\Support\Facades\Artisan::output();
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/run-seeder', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        return 'Seeder completed successfully: ' . \Illuminate\Support\Facades\Artisan::output();
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});


Route::get("storage/{path}", function ($path) {
    $file = storage_path("app/public/" . $path);
    if (!file_exists($file)) {
        abort(404);
    }
    
    $mimeType = \Illuminate\Support\Facades\File::mimeType($file);
    return response()->file($file, ["Content-Type" => $mimeType]);
})->where("path", ".*");

