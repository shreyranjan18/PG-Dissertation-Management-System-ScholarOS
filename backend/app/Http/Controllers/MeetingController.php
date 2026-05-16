<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Meeting;
use App\Models\Notification;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Meeting::with(['student', 'faculty', 'dissertation']);

        if ($user->role === 'student') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'faculty' || $user->role === 'examiner') {
            $query->where('faculty_id', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'faculty_id' => 'required|exists:users,id',
            'dissertation_id' => 'nullable|exists:dissertations,id',
            'scheduled_at' => 'required|date',
            'topic' => 'nullable|string',
            'type' => 'nullable|string',
            'location' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $status = $user->role === 'student' ? 'pending' : 'scheduled';

        $meeting = Meeting::create([
            'student_id' => $request->student_id,
            'faculty_id' => $request->faculty_id,
            'dissertation_id' => $request->dissertation_id,
            'scheduled_at' => $request->scheduled_at,
            'topic' => $request->topic ?? 'Mentorship Session',
            'type' => $request->type ?? 'virtual',
            'location' => $request->location,
            'notes' => $request->notes,
            'status' => $status,
            'requested_by' => $user->id
        ]);

        $notifyId = ($user->id == $request->student_id) ? $request->faculty_id : $request->student_id;
        
        Notification::create([
            'user_id' => $notifyId,
            'title' => 'Meeting Request',
            'message' => $user->name . ' has ' . ($status === 'pending' ? 'requested' : 'scheduled') . ' a meeting: ' . ($request->topic ?? 'Mentorship'),
            'type' => 'meeting'
        ]);

        return response()->json($meeting, 201);
    }

    public function show($id)
    {
        return response()->json(Meeting::with(['student', 'faculty', 'dissertation'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);
        
        $request->validate([
            'scheduled_at' => 'nullable|date',
            'topic' => 'nullable|string',
            'location' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $meeting->update($request->only(['scheduled_at', 'topic', 'location', 'notes', 'status']));

        return response()->json($meeting);
    }

    public function respond(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:scheduled,rejected',
            'rejection_reason' => 'required_if:status,rejected|string|nullable'
        ]);

        $meeting = Meeting::findOrFail($id);
        $meeting->status = $request->status;
        $meeting->rejection_reason = $request->rejection_reason;
        $meeting->save();

        Notification::create([
            'user_id' => $meeting->student_id,
            'title' => 'Meeting Update',
            'message' => 'Your meeting request has been ' . ($request->status === 'scheduled' ? 'Approved' : 'Rejected') . '. ' . ($request->rejection_reason ?? ''),
            'type' => 'meeting'
        ]);

        return response()->json($meeting);
    }
}
