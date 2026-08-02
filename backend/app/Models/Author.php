<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'bio', 'image_url', 'order'];

    public function works()
    {
        return $this->hasMany(AuthorWork::class)->orderBy('order', 'asc')->orderBy('year', 'desc');
    }

    public function experiences()
    {
        return $this->hasMany(AuthorExperience::class)->orderBy('order', 'asc')->orderBy('years', 'desc');
    }
}
