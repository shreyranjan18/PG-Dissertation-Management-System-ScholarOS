<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    private function callGemini($prompt)
    {
        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}";

        try {
            $response = Http::post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);
            
            if ($response->failed()) {
                \Log::error("Gemini Chat Error: " . $response->status() . " - " . $response->body());
                return "AI Service Error (" . $response->status() . ")";
            }

            return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? "I'm processing that...";
        } catch (\Exception $e) { 
            \Log::error("Gemini Chat Exception: " . $e->getMessage());
            return "I'm having trouble thinking right now."; 
        }
    }

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $contactId = $request->query('contact_id');
        $chapterId = $request->query('chapter_id');
        $dissertationId = $request->query('dissertation_id');

        $query = Message::query();

        if ($chapterId) {
            $query->where('chapter_id', $chapterId);
        } elseif ($dissertationId) {
            $query->where('dissertation_id', $dissertationId)->whereNull('chapter_id');
        } elseif ($contactId !== null) {
            $currentUser = $request->user();
            $targetUser = User::find($contactId);
            
            // Shared HOD view: If the conversation involves an HOD, unify it
            $isHODInvolved = $currentUser->role === 'hod' || ($targetUser->role ?? '') === 'hod';

            $query->where(function($q) use ($userId, $contactId, $isHODInvolved, $currentUser, $targetUser) {
                if ($isHODInvolved) {
                    $hodIds = User::where('role', 'hod')->pluck('id')->toArray();
                    $studentId = $currentUser->role === 'hod' ? $contactId : $userId;
                    
                    // All messages sent BY the student TO any HOD
                    $q->where('sender_id', $studentId)->whereIn('receiver_id', $hodIds);
                } else {
                    $q->where('sender_id', $userId)->where('receiver_id', $contactId);
                }
            })->orWhere(function($q) use ($userId, $contactId, $isHODInvolved, $currentUser, $targetUser) {
                if ($isHODInvolved) {
                    $hodIds = User::where('role', 'hod')->pluck('id')->toArray();
                    $studentId = $currentUser->role === 'hod' ? $contactId : $userId;
                    
                    // All messages sent BY any HOD TO the student
                    $q->whereIn('sender_id', $hodIds)->where('receiver_id', $studentId);
                } else {
                    $q->where('sender_id', $contactId)->where('receiver_id', $userId);
                }
            });
        }

        if ($chapterId || $dissertationId || $contactId !== null) {
            return $query->orderBy('created_at', 'asc')->get([
                'id', 'sender_id', 'receiver_id', 'content', 'created_at', 'dissertation_id', 'chapter_id'
            ]);
        }

        // 1. Get everyone they have already messaged
        $senders = Message::where('receiver_id', $userId)->pluck('sender_id')->toArray();
        $receivers = Message::where('sender_id', $userId)->pluck('receiver_id')->toArray();
        $contactIds = array_unique(array_merge($senders, $receivers));
        
        // 2. Add people from their dissertations (Guides, Students, Examiners)
        $dissertations = \App\Models\Dissertation::where('student_id', $userId)
            ->orWhere('guide_id', $userId)
            ->orWhere('examiner_id', $userId)
            ->get();
            
        foreach ($dissertations as $d) {
            if ($d->student_id) $contactIds[] = $d->student_id;
            if ($d->guide_id) $contactIds[] = $d->guide_id;
            if ($d->examiner_id) $contactIds[] = $d->examiner_id;
        }

        // 3. Dynamic HOD Connectivity
        $currentUser = $request->user();
        if ($currentUser->role === 'hod') {
            // HOD sees everyone (Students and Faculty)
            $others = User::whereIn('role', ['student', 'faculty'])->pluck('id')->toArray();
            $contactIds = array_merge($contactIds, $others);
        } else {
            // Students and Faculty always see the HODs
            $hods = User::where('role', 'hod')->pluck('id')->toArray();
            $contactIds = array_merge($contactIds, $hods);
        }

        // Cleanup
        $contactIds = array_filter(array_unique($contactIds), function($id) use ($userId) {
            return $id != $userId && $id != 0;
        });
        
        return User::whereIn('id', $contactIds)->get(['id', 'name', 'role', 'email']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'nullable',
            'content' => 'required|string',
            'dissertation_id' => 'nullable|exists:dissertations,id',
            'chapter_id' => 'nullable|exists:chapters,id'
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'dissertation_id' => $request->dissertation_id,
            'chapter_id' => $request->chapter_id,
            'content' => $request->content,
        ]);

        // Only trigger AI if it's a global chat with AI (receiver_id 0) and NO chapter_id
        if ($request->receiver_id == 0 && !$request->chapter_id) {
            $aiResponse = $this->callGemini("The student says: '{$request->content}'. Act as an academic dissertation guide. Provide a helpful, encouraging, and concise response.");
            Message::create([
                'sender_id' => 0,
                'receiver_id' => $request->user()->id,
                'content' => $aiResponse,
            ]);
        }

        // Notify Receiver
        if ($request->receiver_id && $request->receiver_id != 0) {
            $senderName = $request->user()->name;
            $chapterTitle = \App\Models\Chapter::find($request->chapter_id)->title ?? null;
            
            $notifTitle = 'New Message from ' . $senderName;
            $notifMsg = $chapterTitle 
                ? "Sent a message regarding \"{$chapterTitle}\"" 
                : "Sent you a message in the global chat.";
            
            $notifLink = $request->chapter_id 
                ? '/mentorship?dissertation_id=' . $request->dissertation_id 
                : '/chat';

            \App\Models\Notification::create([
                'user_id' => $request->receiver_id,
                'title' => $notifTitle,
                'message' => $notifMsg,
                'type' => 'chat',
                'link' => $notifLink
            ]);
            
            \Log::info("Notification created for user {$request->receiver_id} from {$senderName}");
        }

        return response()->json($message, 201);
    }
}
