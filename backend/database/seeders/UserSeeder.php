<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin SCWMS',
            'email' => 'admin@scwms.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'aktif',
        ]);

        User::create([
            'name' => 'Operator SCWMS',
            'email' => 'operator@scwms.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
            'status' => 'aktif',
        ]);
    }
}
