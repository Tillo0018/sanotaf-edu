<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'question_text',
        'options',
        'type',
        'ai_rubric',
        'video_timestamp',
    ];

    protected $casts = [
        'options' => 'array',
        'video_timestamp' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
