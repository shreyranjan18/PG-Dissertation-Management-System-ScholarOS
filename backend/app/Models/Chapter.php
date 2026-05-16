<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'dissertation_id',
        'title',
        'description',
        'file_path',
        'status',
        'guide_feedback',
        'order',
        'due_date',
    ];

    public function dissertation()
    {
        return $this->belongsTo(Dissertation::class);
    }
}
