<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dissertation;
use App\Models\User;

class DashboardController extends Controller
{
    public function student(Request $request)
    {
        $user = $request->user();
        $dissertations = Dissertation::where('student_id', $user->id)->get();
        $totalCount = $dissertations->count();
        $approvedCount = $dissertations->where('status', 'approved')->count();
        $rejectedCount = $dissertations->where('status', 'rejected')->count();
        $completedCount = $dissertations->where('status', 'completed')->count();
        
        // Calculate average marks across all dissertations
        $avgMarks = $dissertations->whereNotNull('total_marks')->avg('total_marks') ?? 0;
        
        // Success rate based on approvals and completions
        $successRate = $totalCount > 0 ? round((($approvedCount + $completedCount) / $totalCount) * 100) : 0;
        
        $health = $completedCount >= 4 ? 100 : ( $totalCount > 0 ? min(95, ($completedCount * 20) + ($approvedCount * 10) + ($totalCount * 5)) : 0);
        
        $gradProgress = min(100, ($completedCount / 4) * 100);

        return response()->json([
            'total_dissertations' => $totalCount,
            'approved_submissions' => $approvedCount,
            'rejected_submissions' => $rejectedCount,
            'completed_count' => $completedCount,
            'required_count' => 4,
            'graduation_progress' => $gradProgress,
            'pending_reviews' => $totalCount - $approvedCount - $rejectedCount - $completedCount,
            'avg_marks' => round($avgMarks, 1),
            'success_rate' => $successRate,
            'health_score' => $health,
            'draft_count' => $totalCount,
            'review_count' => \App\Models\Feedback::whereIn('dissertation_id', $dissertations->pluck('id'))->count(),
            'citation_count' => $totalCount * 12,
            'next_step' => $completedCount >= 4 ? "Graduated" : "Project " . ($completedCount + 1) . " of 4",
            'viva_month' => "Dec",
            'skill_radar' => [
                ['subject' => 'Research', 'A' => 85, 'fullMark' => 100],
                ['subject' => 'Analysis', 'A' => 70, 'fullMark' => 100],
                ['subject' => 'Writing', 'A' => 90, 'fullMark' => 100],
                ['subject' => 'AI Ethics', 'A' => 65, 'fullMark' => 100],
                ['subject' => 'Viva Voce', 'A' => 80, 'fullMark' => 100],
            ],
            'submission_trend' => [
                ['name' => 'Mon', 'submitted' => 1, 'approved' => 0, 'rejected' => 0],
                ['name' => 'Tue', 'submitted' => 2, 'approved' => 1, 'rejected' => 0],
                ['name' => 'Wed', 'submitted' => 1, 'approved' => 1, 'rejected' => 1],
                ['name' => 'Thu', 'submitted' => 3, 'approved' => 2, 'rejected' => 0],
                ['name' => 'Fri', 'submitted' => $totalCount, 'approved' => $approvedCount, 'rejected' => $rejectedCount],
            ],
            'upcoming_schedule' => \App\Models\Meeting::where('student_id', $user->id)
                ->where('scheduled_at', '>', now())
                ->orderBy('scheduled_at', 'asc')
                ->take(3)
                ->get(),
            'next_meeting' => \App\Models\Meeting::where('student_id', $user->id)
                ->where('scheduled_at', '>', now())
                ->orderBy('scheduled_at', 'asc')
                ->first()
        ]);
    }

    public function faculty(Request $request)
    {
        $user = $request->user();
        $dissertations = Dissertation::where('guide_id', $user->id)->with('student')->get();
        
        $total = $dissertations->count();
        $pending = $dissertations->where('status', 'pending')->count() + $dissertations->where('status', 'pending_approval')->count();
        $approved = $dissertations->where('status', 'approved')->count();
        $successRate = $total > 0 ? round(($approved / $total) * 100) : 0;

        return response()->json([
            'total_assigned' => $total,
            'pending_tasks' => $pending,
            'success_rate' => $successRate,
            'upcoming_meetings' => \App\Models\Meeting::where('faculty_id', $user->id)->where('scheduled_at', '>', now())->count(),
            'queue' => $dissertations->take(5)->map(fn($d) => [
                'id' => $d->id,
                'title' => $d->title,
                'student' => $d->student?->name ?? 'Unknown',
                'dept' => $d->department,
                'status' => $d->status
            ])
        ]);
    }


    public function hod(Request $request)
    {
        $unassigned = Dissertation::whereNull('guide_id')->get();
        $totalStudents = User::where('role', 'student')->count();
        $totalFaculty = User::where('role', 'faculty')->count();

        return response()->json([
            'total_students' => $totalStudents,
            'total_faculty' => $totalFaculty,
            'unassigned_topics' => $unassigned->count(),
            'pending_proposals' => $unassigned, // The actual list for the HOD to work on
            'faculty_list' => User::whereIn('role', ['faculty', 'examiner'])->get(['id', 'name'])
        ]);
    }

    public function examiner(Request $request)
    {
        return response()->json([
            'total_assigned' => 10, // Mock
            'pending_tasks' => 2, // Mock
            'success_rate' => 95, // Mock
            'upcoming_meetings' => 1, // Mock
        ]);
    }

    public function admin(Request $request)
    {
        return response()->json([
            'total_students' => User::where('role', 'student')->count(),
            'total_faculty' => User::where('role', 'faculty')->count(),
            'dissertations_in_review' => Dissertation::where('status', 'pending_approval')->count(),
            'avg_plagiarism' => 7.4,
        ]);
    }
}
