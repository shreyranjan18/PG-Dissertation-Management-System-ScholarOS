<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = [
        'student_id',
        'faculty_id',
        'dissertation_id',
        'scheduled_at',
        'topic',
        'status',
        'notes',
        'type',
        'location',
        'rejection_reason',
        'requested_by',
    ];

    public function dissertation() {
        return $this->belongsTo(Dissertation::class);
    }

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function faculty() {
        return $this->belongsTo(User::class, 'faculty_id');
    }
}
