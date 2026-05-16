<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dissertation;
use App\Models\Chapter;
use App\Models\Notification;
use App\Models\User;

class DissertationController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Dissertation::with(['student', 'guide', 'chapters']);

        if ($user->role === 'student') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'faculty') {
            $query->where('guide_id', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        \Log::info('Dissertation store request received', $request->all());
        $request->validate([
            'title' => 'required|string',
            'abstract' => 'nullable|string',
            'domain' => 'nullable|string',
            'research_area' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx'
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('dissertations', 'public');
        }

        $dissertation = Dissertation::create([
            'title' => $request->title,
            'abstract' => $request->abstract,
            'domain' => $request->domain,
            'research_area' => $request->research_area,
            'department' => $request->user()->department,
            'student_id' => $request->user()->id,
            'file_path' => $filePath,
            'status' => 'pending_approval',
        ]);

        return response()->json($dissertation, 201);
    }

    public function show($id)
    {
        $dissertation = Dissertation::with(['student', 'guide', 'chapters'])->findOrFail($id);
        return response()->json($dissertation);
    }

    public function assignGuide(Request $request, $id)
    {
        $request->validate([
            'guide_id' => 'required|exists:users,id',
            'deadlines' => 'nullable|array' // Array of 5 dates
        ]);

        $dissertation = Dissertation::findOrFail($id);
        
        $dissertation->guide_id = $request->guide_id;
        $dissertation->status = 'approved'; 
        $dissertation->save();

        // Initialize Chapter Board with Deadlines
        $templates = [
            'Chapter 1: Introduction',
            'Chapter 2: Literature Review',
            'Chapter 3: Methodology',
            'Chapter 4: Data Analysis',
            'Chapter 5: Conclusion & Future Work'
        ];

        foreach ($templates as $index => $title) {
            $dueDate = isset($request->deadlines[$index]) ? $request->deadlines[$index] : null;
            
            Chapter::updateOrCreate([
                'dissertation_id' => $dissertation->id,
                'title' => $title,
            ], [
                'order' => $index + 1,
                'status' => 'pending',
                'due_date' => $dueDate
            ]);
        }

        // Notify Student
        Notification::create([
            'user_id' => $dissertation->student_id,
            'title' => 'Topic Officially Approved! 🎉',
            'message' => 'Congratulations! Your topic "' . $dissertation->title . '" has been approved and a guide assigned. Your mentorship hub is now open.',
            'type' => 'approval',
            'link' => '/mentorship?dissertation_id=' . $dissertation->id
        ]);

        return response()->json([
            'message' => 'Topic approved and Chapter Board initialized with deadlines!',
            'dissertation' => $dissertation
        ]);
    }

    public function finalApprove(Request $request, $id)
    {
        $request->validate([
            'examiner_id' => 'required|exists:users,id',
        ]);

        $dissertation = Dissertation::findOrFail($id);
        
        $dissertation->status = 'viva_scheduled';
        $dissertation->examiner_id = $request->examiner_id;
        $dissertation->final_approved_at = now();
        $dissertation->save();

        // Automatically schedule Viva 10 days from now
        $vivaDate = now()->addDays(10)->setHour(10)->setMinute(0);
        
        \App\Models\Meeting::create([
            'student_id' => $dissertation->student_id,
            'faculty_id' => $request->examiner_id,
            'dissertation_id' => $dissertation->id,
            'scheduled_at' => $vivaDate,
            'topic' => 'Final Viva Voce: ' . $dissertation->title,
            'type' => 'viva',
            'status' => 'scheduled',
            'location' => 'TBD (Google Meet)',
            'notes' => 'This is an automatically scheduled final Viva Voce examination.'
        ]);

        Notification::create([
            'user_id' => $dissertation->student_id,
            'title' => 'Dissertation Approved & Viva Scheduled! 🎓',
            'message' => 'Your final dissertation has been approved by the HOD. Your Viva Voce is scheduled for ' . $vivaDate->format('M d, Y @ h:i A') . '.',
            'type' => 'viva',
            'link' => '/viva?dissertation_id=' . $dissertation->id
        ]);

        Notification::create([
            'user_id' => $request->examiner_id,
            'title' => 'New Viva Assignment',
            'message' => 'You have been assigned as the examiner for "' . $dissertation->title . '". Viva is scheduled for ' . $vivaDate->format('M d, Y @ h:i A') . '.',
            'type' => 'viva',
            'link' => '/viva?dissertation_id=' . $dissertation->id
        ]);

        return response()->json([
            'message' => 'Dissertation final approval successful. Viva scheduled!',
            'dissertation' => $dissertation
        ]);
    }

    public function pendingFinalReview(Request $request)
    {
        // Optimized: Get dissertations with 5 approved chapters in a single query
        $dissertations = Dissertation::with(['student', 'guide'])
            ->where('status', 'approved')
            ->withCount(['chapters as approved_chapters_count' => function($query) {
                $query->where('status', 'approved');
            }])
            ->having('approved_chapters_count', '>=', 5)
            ->get();

        return response()->json($dissertations);
    }

    public function submitMarks(Request $request, $id)
    {
        $dissertation = Dissertation::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'marks' => 'required|integer|min:0|max:100',
            'type' => 'required|in:guide,hod,viva'
        ]);

        if ($request->type === 'guide') {
            if ($user->role !== 'faculty' || $dissertation->guide_id !== $user->id) {
                return response()->json(['message' => 'Only the assigned Guide can submit Guide marks'], 403);
            }
            $dissertation->guide_marks = $request->marks;
        } elseif ($request->type === 'hod') {
            if ($user->role !== 'hod' && !($user->role === 'faculty' && $user->id == 1)) {
                return response()->json(['message' => 'Only the HOD can submit HOD marks'], 403);
            }
            $dissertation->hod_marks = $request->marks;
        } elseif ($request->type === 'viva') {
            // Check if user is the assigned examiner or has authorization
            if ($user->id != $dissertation->examiner_id && $user->role !== 'hod' && $user->role !== 'admin' && $user->role !== 'examiner') {
                return response()->json(['message' => 'Unauthorized to submit Viva marks'], 403);
            }
            $dissertation->examiner_marks = $request->marks;
            
            if ($request->marks < 30) {
                $dissertation->status = 'viva_failed';
            } else {
                $dissertation->status = 'completed';
            }
        }

        // Auto-calculate total marks
        $g = $dissertation->guide_marks ?? 0;
        $h = $dissertation->hod_marks ?? 0;
        $e = $dissertation->examiner_marks ?? 0;
        
        $count = ($dissertation->guide_marks !== null ? 1 : 0) + 
                 ($dissertation->hod_marks !== null ? 1 : 0) + 
                 ($dissertation->examiner_marks !== null ? 1 : 0);

        if ($count > 0) {
            $dissertation->total_marks = round(($g + $h + $e) / $count);
        }

        $dissertation->save();

        Notification::create([
            'user_id' => $dissertation->student_id,
            'title' => 'Marks Updated 📊',
            'message' => 'New marks have been posted for your dissertation. Check your report card.',
            'type' => 'grade',
            'link' => '/report-card'
        ]);

        return response()->json([
            'message' => 'Marks submitted successfully',
            'dissertation' => $dissertation
        ]);
    }

    public function approveRetake(Request $request, $id)
    {
        $dissertation = Dissertation::findOrFail($id);
        
        // Reset status so HOD can Final Approve it again
        $dissertation->status = 'approved';
        $dissertation->examiner_marks = null;
        $dissertation->save();

        Notification::create([
            'user_id' => $dissertation->student_id,
            'title' => 'Retake Approved! 🔄',
            'message' => 'The HOD has approved your request for a re-viva. Please prepare for your new examination slot.',
            'type' => 'viva',
            'link' => '/viva?dissertation_id=' . $dissertation->id
        ]);

        return response()->json([
            'message' => 'Retake approved successfully. You can now re-schedule the Viva.',
            'dissertation' => $dissertation
        ]);
    }

    public function update(Request $request, $id)
    {
        $dissertation = Dissertation::findOrFail($id);
        $data = $request->only(['title', 'abstract', 'status']);
        
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('dissertations', 'public');
        }

        $dissertation->update($data);

        return response()->json($dissertation);
    }

    public function destroy($id)
    {
        $dissertation = Dissertation::findOrFail($id);
        $dissertation->delete();
        return response()->json(null, 204);
    }
}
