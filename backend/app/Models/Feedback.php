<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'dissertation_id',
        'faculty_id',
        'comments',
        'status_update',
    ];

    public function dissertation() {
        return $this->belongsTo(Dissertation::class);
    }

    public function faculty() {
        return $this->belongsTo(User::class, 'faculty_id');
    }
}
