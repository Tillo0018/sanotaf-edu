<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthorWork extends Model
{
    use HasFactory;

    protected $fillable = ['author_id', 'title', 'type', 'year', 'file_url', 'order'];

    public function author()
    {
        return $this->belongsTo(Author::class);
    }
}
