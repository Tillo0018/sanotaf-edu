<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StdsSurvey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'answers',
        'score_reflexive',
        'score_cognitive',
        'score_constructive',
        'score_motivational',
        'score_emotional',
        'total_score'
    ];

    protected $casts = [
        'answers' => 'array',
        'score_reflexive' => 'float',
        'score_cognitive' => 'float',
        'score_constructive' => 'float',
        'score_motivational' => 'float',
        'score_emotional' => 'float',
        'total_score' => 'float'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
