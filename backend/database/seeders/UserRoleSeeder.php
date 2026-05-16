<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'student' => 'Student Scholar',
            'faculty' => 'Dr. Sarah Guide',
            'hod' => 'Prof. James HOD',
            'examiner' => 'Viva Examiner',
            'admin' => 'System Administrator',
        ];

        foreach ($roles as $role => $name) {
            User::updateOrCreate(
                ['email' => "$role@example.com"],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => $role,
                    'department' => 'Computer Science'
                ]
            );
        }
    }
}
