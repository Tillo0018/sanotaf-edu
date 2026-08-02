<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectInfo extends Model
{
    use HasFactory;

    protected $table = 'project_infos';

    protected $fillable = ['title', 'content', 'image_url', 'order'];
}
