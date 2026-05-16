<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $fillable = [
        'dissertation_id',
        'evaluator_id',
        'remarks',
        'marks',
        'status',
    ];

    public function dissertation() {
        return $this->belongsTo(Dissertation::class);
    }

    public function evaluator() {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
