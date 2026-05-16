<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chapter;
use App\Models\Dissertation;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;

class ChapterController extends Controller
{
    public function index(Request $request, $id)
    {
        try {
            $dissertation = Dissertation::find($id);
            $chapters = Chapter::where('dissertation_id', $id)->orderBy('order')->get();

            // Create chapters if they don't exist, but DO NOT assign default deadlines
            if ($chapters->isEmpty()) {
                $templates = [
                    'Chapter 1: Introduction',
                    'Chapter 2: Literature Review',
                    'Chapter 3: Methodology',
                    'Chapter 4: Data Analysis',
                    'Chapter 5: Conclusion & Future Work'
                ];

                foreach ($templates as $index => $title) {
                    Chapter::create([
                        'dissertation_id' => $id,
                        'title' => $title,
                        'order' => $index + 1,
                        'status' => 'pending',
                        'due_date' => null // Deadlines must be set by HOD explicitly
                    ]);
                }
                $chapters = Chapter::where('dissertation_id', $id)->orderBy('order')->get();
            }

            return response()->json($chapters);
        } catch (\Exception $e) {
            \Log::error("Chapter Hub Error: " . $e->getMessage());
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'dissertation_id' => 'required|exists:dissertations,id',
            'title' => 'required|string',
            'file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('chapters', 'public');
        }
        $chapter = Chapter::create([
            'dissertation_id' => $request->dissertation_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'order' => Chapter::where('dissertation_id', $request->dissertation_id)->count() + 1
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('chapters', 'public');
            $chapter->file_path = $path;
            $chapter->status = 'submitted'; // Auto-move to submitted status
            $chapter->save();

            // Notify Guide
            $dissertation = Dissertation::find($chapter->dissertation_id);
            if ($dissertation && $dissertation->guide_id) {
                Notification::create([
                    'user_id' => $dissertation->guide_id,
                    'title' => 'Chapter Draft Uploaded',
                    'message' => 'Student ' . $request->user()->name . ' has uploaded a new draft for ' . $chapter->title,
                    'type' => 'dissertation'
                ]);
            }
        }

        return response()->json($chapter, 201);
    }

    public function update(Request $request, $id)
    {
        $chapter = Chapter::findOrFail($id);
        
        $request->validate([
            'status' => 'nullable|string',
            'guide_feedback' => 'nullable|string',
        ]);

        if ($request->status) $chapter->status = $request->status;
        if ($request->guide_feedback) $chapter->guide_feedback = $request->guide_feedback;
        
        if ($request->hasFile('file')) {
            if ($chapter->file_path) Storage::disk('public')->delete($chapter->file_path);
            $path = $request->file('file')->store('chapters', 'public');
            $chapter->file_path = $path;
        }

        $chapter->save();

        // Notify Student
        $dissertation = Dissertation::find($chapter->dissertation_id);
        if ($dissertation) {
            $msg = $request->status === 'approved' ? 'Your ' . $chapter->title . ' has been APPROVED!' : 'New feedback received for ' . $chapter->title;
            Notification::create([
                'user_id' => $dissertation->student_id,
                'title' => 'Chapter Board Update',
                'message' => $msg . ' (Dissertation: ' . $dissertation->title . ')',
                'type' => 'dissertation',
                'link' => '/mentorship?dissertation_id=' . $dissertation->id
            ]);
        }

        return response()->json($chapter);
    }
}
