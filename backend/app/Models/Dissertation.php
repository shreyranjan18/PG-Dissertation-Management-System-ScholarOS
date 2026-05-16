<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dissertation extends Model
{
    protected $fillable = [
        'title',
        'abstract',
        'student_id',
        'guide_id',
        'domain',
        'department',
        'research_area',
        'file_path',
        'progress',
        'status',
        'ai_summary',
        'examiner_id',
        'final_approved_at',
        'guide_marks',
        'hod_marks',
        'examiner_marks',
        'total_marks',
    ];

    protected $casts = [
        'ai_suggestions' => 'array',
    ];

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function guide() {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function examiner() {
        return $this->belongsTo(User::class, 'examiner_id');
    }

    public function chapters() {
        return $this->hasMany(Chapter::class);
    }

    public function feedback() {
        return $this->hasMany(Feedback::class);
    }

    public function evaluations() {
        return $this->hasMany(Evaluation::class);
    }
}
