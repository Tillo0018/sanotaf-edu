<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthorExperience extends Model
{
    use HasFactory;

    protected $fillable = ['author_id', 'years', 'position', 'workplace', 'order'];

    public function author()
    {
        return $this->belongsTo(Author::class);
    }
}
