<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ComponentDataSeeder::class,
            DepartmentSeeder::class,
        ]);

        \App\Models\User::updateOrCreate(
            ['email' => 'admin@asja.mg'],
            [
                'name' => 'Admin',
                'last_name' => 'ASJA',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'Admin',
            ]
        );
    }
}
