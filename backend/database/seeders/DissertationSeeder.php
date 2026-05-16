<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Dissertation;
use Illuminate\Database\Seeder;

class DissertationSeeder extends Seeder
{
    public function run(): void
    {
        $student = User::where('email', 'student@example.com')->first();
        $faculty = User::where('email', 'faculty@example.com')->first();

        if ($student && $faculty) {
            Dissertation::updateOrCreate(
                ['student_id' => $student->id],
                [
                    'title' => 'AI-Driven Predictive Analysis for Sustainable Energy Grids',
                    'abstract' => 'This research explores the integration of machine learning models to predict energy consumption patterns and optimize the distribution of renewable energy across smart grids.',
                    'guide_id' => $faculty->id,
                    'department' => 'Computer Science',
                    'domain' => 'Machine Learning',
                    'research_area' => 'Sustainable Energy',
                    'status' => 'approved',
                    'progress' => 45
                ]
            );
        }
    }
}
