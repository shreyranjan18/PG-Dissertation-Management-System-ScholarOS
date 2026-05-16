<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Models\Dissertation;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'dissertation_id' => 'required|exists:dissertations,id',
            'comments' => 'required|string',
            'status' => 'nullable|string'
        ]);

        $feedback = \App\Models\Feedback::create([
            'dissertation_id' => $request->dissertation_id,
            'faculty_id' => $request->user()->id,
            'comments' => $request->comments,
            'status_update' => $request->status ?? 'feedback_added'
        ]);

        $dissertation = Dissertation::find($request->dissertation_id);

        // If status is provided, update the dissertation status too
        if ($request->status) {
            $dissertation->status = $request->status;
            $dissertation->save();
        }

        // Notify Student
        \App\Models\Notification::create([
            'user_id' => $dissertation->student_id,
            'title' => 'New Official Remarks Logged',
            'message' => 'Guide ' . $request->user()->name . ' has added formal feedback to your research portfolio: ' . $dissertation->title,
            'type' => 'dissertation',
            'link' => '/mentorship?dissertation_id=' . $dissertation->id
        ]);

        return response()->json($feedback, 201);
    }

    public function getByDissertation($id)
    {
        return Feedback::where('dissertation_id', $id)->with('faculty')->orderBy('created_at', 'desc')->get();
    }
}
