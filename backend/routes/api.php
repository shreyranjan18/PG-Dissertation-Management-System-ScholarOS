<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DissertationController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChapterController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboards
    Route::get('/dashboard/student', [DashboardController::class, 'student']);
    Route::get('/dashboard/faculty', [DashboardController::class, 'faculty']);
    Route::get('/dashboard/hod', [DashboardController::class, 'hod']);
    Route::get('/dashboard/examiner', [DashboardController::class, 'examiner']);
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);

    // Dissertations
    Route::post('/dissertations/{id}/assign-guide', [DissertationController::class, 'assignGuide']);
    Route::get('/dissertations/pending-final-review', [DissertationController::class, 'pendingFinalReview']);
    Route::post('/dissertations/{id}/final-approve', [DissertationController::class, 'finalApprove']);
    Route::post('/dissertations/{id}/submit-marks', [DissertationController::class, 'submitMarks']);
    Route::post('/dissertations/{id}/approve-retake', [DissertationController::class, 'approveRetake']);
    // Chapters
    Route::get('/chapters-by-dissertation/{id}', [ChapterController::class, 'index']);
    Route::post('/chapters', [ChapterController::class, 'store']);
    Route::post('/chapters/{id}', [ChapterController::class, 'update']); 

    Route::apiResource('dissertations', DissertationController::class);
    
    // Feedback
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::get('/dissertations/{id}/feedback', [FeedbackController::class, 'getByDissertation']);
    Route::apiResource('feedback', FeedbackController::class)->except(['store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Meetings
    Route::post('/meetings/{id}/respond', [MeetingController::class, 'respond']);
    Route::apiResource('meetings', MeetingController::class);

    // AI Analysis
    Route::get('/ai/summary/{id}', [AIController::class, 'summary']);
    Route::post('/ai/apply/{id}', [AIController::class, 'applySuggestion']);
    Route::get('/ai/plagiarism/{id}', [AIController::class, 'plagiarism']);

    // Chat
    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat', [ChatController::class, 'store']);
});
