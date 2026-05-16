<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Dissertation;
use App\Models\Chapter;
use App\Models\Feedback;
use App\Models\Meeting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
        
        // 1. Create Faculty for each department
        $faculties = [];
        foreach ($departments as $dept) {
            $name = $this->getFacultyName($dept);
            $faculties[$dept] = User::updateOrCreate(
                ['email' => strtolower(str_replace(' ', '.', $name)) . '@example.com'],
                [
                    'name' => "Dr. $name",
                    'password' => Hash::make('password'),
                    'role' => 'faculty',
                    'department' => $dept
                ]
            );
        }

        // 2. Create Students and Dissertations
        $studentData = [
            ['name' => 'Alice Smith', 'dept' => 'Computer Science', 'status' => 'approved', 'title' => 'Quantum Computing Algorithms for Optimization'],
            ['name' => 'Bob Johnson', 'dept' => 'Computer Science', 'status' => 'viva_scheduled', 'title' => 'Secure Blockchain Protocols for IoT'],
            ['name' => 'Charlie Brown', 'dept' => 'Electronics', 'status' => 'pending_approval', 'title' => 'Low Power VLSI Design for Edge AI'],
            ['name' => 'Diana Prince', 'dept' => 'Electronics', 'status' => 'approved', 'title' => '5G Signal Processing in Urban Environments'],
            ['name' => 'Ethan Hunt', 'dept' => 'Mechanical', 'status' => 'completed', 'title' => 'Autonomous Robotics in Manufacturing'],
            ['name' => 'Fiona Gallagher', 'dept' => 'Civil', 'status' => 'approved', 'title' => 'Sustainable Urban Infrastructure Design'],
            ['name' => 'George Miller', 'dept' => 'Computer Science', 'status' => 'viva_failed', 'title' => 'AI in Healthcare: Ethical Implications'],
        ];

        foreach ($studentData as $data) {
            $student = User::updateOrCreate(
                ['email' => strtolower(str_replace(' ', '.', $data['name'])) . '@example.com'],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'department' => $data['dept']
                ]
            );

            $dissertation = Dissertation::updateOrCreate(
                ['student_id' => $student->id],
                [
                    'title' => $data['title'],
                    'abstract' => "This research focuses on the core challenges of {$data['title']}, aiming to provide innovative solutions and comprehensive analysis within the {$data['dept']} domain.",
                    'guide_id' => $faculties[$data['dept']]->id,
                    'department' => $data['dept'],
                    'domain' => $data['dept'],
                    'status' => $data['status'],
                    'progress' => ($data['status'] === 'completed') ? 100 : (($data['status'] === 'approved') ? 60 : 0),
                    'guide_marks' => ($data['status'] === 'completed' || $data['status'] === 'viva_scheduled') ? rand(80, 95) : null,
                    'hod_marks' => ($data['status'] === 'completed' || $data['status'] === 'viva_scheduled') ? rand(80, 95) : null,
                ]
            );

            // 3. Add Chapters for active dissertations
            if (in_array($data['status'], ['approved', 'viva_scheduled', 'completed'])) {
                $chapterTitles = ['Introduction', 'Literature Review', 'Methodology', 'Data Analysis', 'Conclusion'];
                foreach ($chapterTitles as $index => $title) {
                    $status = ($data['status'] === 'completed') ? 'approved' : (($index < 3) ? 'approved' : 'pending');
                    Chapter::create([
                        'dissertation_id' => $dissertation->id,
                        'title' => "Chapter " . ($index + 1) . ": $title",
                        'order' => $index + 1,
                        'status' => $status,
                        'due_date' => now()->addWeeks($index + 2),
                        'guide_feedback' => ($status === 'approved') ? 'Well researched and clearly presented.' : null,
                    ]);
                }
            }

            // 4. Add some Feedback
            if ($data['status'] !== 'pending_approval') {
                Feedback::create([
                    'dissertation_id' => $dissertation->id,
                    'faculty_id' => $faculties[$data['dept']]->id,
                    'comments' => "Initial review of the topic is positive. Please focus on the methodology section.",
                    'status_update' => 'approved'
                ]);
            }
            
            // 5. Add a Sample Meeting
            if ($data['status'] === 'approved') {
                Meeting::create([
                    'dissertation_id' => $dissertation->id,
                    'student_id' => $student->id,
                    'faculty_id' => $faculties[$data['dept']]->id,
                    'topic' => 'Monthly Progress Review',
                    'type' => 'virtual',
                    'scheduled_at' => now()->addDays(rand(1, 10))->setHour(14)->setMinute(0),
                    'status' => 'scheduled'
                ]);
            }
        }
    }

    private function getFacultyName($dept)
    {
        $names = [
            'Computer Science' => 'Alan Turing',
            'Electronics' => 'Nikola Tesla',
            'Mechanical' => 'Isaac Newton',
            'Civil' => 'Leonardo da Vinci'
        ];
        return $names[$dept] ?? 'John Doe';
    }
}
