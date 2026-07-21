<?php

namespace Database\Seeders;

use App\Models\Sopir;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SopirSeeder extends Seeder
{
    public function run(): void
    {
        $sopirs = [
            [
                'nama' => 'Ahmad Fauzi', 'nik' => '3174010101900001',
                'alamat' => 'Jl. Merdeka No. 1, Tasikmalaya',
                'nomor_hp' => '081234567890', 'armada_id' => 1, 'status' => 'aktif',
                'email' => 'ahmad@scwms.com', 'password' => 'password',
            ],
            [
                'nama' => 'Budi Santoso', 'nik' => '3174010101900002',
                'alamat' => 'Jl. Sudirman No. 23, Tasikmalaya',
                'nomor_hp' => '081234567891', 'armada_id' => 2, 'status' => 'aktif',
                'email' => 'budi@scwms.com', 'password' => 'password',
            ],
            [
                'nama' => 'Cecep Hermawan', 'nik' => '3174010101900003',
                'alamat' => 'Jl. Gatot Subroto No. 45, Tasikmalaya',
                'nomor_hp' => '081234567892', 'armada_id' => 3, 'status' => 'aktif',
                'email' => 'cecep@scwms.com', 'password' => 'password',
            ],
            [
                'nama' => 'Dwi Prasetyo', 'nik' => '3174010101900004',
                'alamat' => 'Jl. Thamrin No. 67, Tasikmalaya',
                'nomor_hp' => '081234567893', 'armada_id' => 4, 'status' => 'tidak_aktif',
                'email' => 'dwi@scwms.com', 'password' => 'password',
            ],
            [
                'nama' => 'Eko Wahyudi', 'nik' => '3174010101900005',
                'alamat' => 'Jl. Kuningan No. 89, Tasikmalaya',
                'nomor_hp' => '081234567894', 'armada_id' => 5, 'status' => 'aktif',
                'email' => 'eko@scwms.com', 'password' => 'password',
            ],
        ];

        foreach ($sopirs as $item) {
            $user = User::create([
                'name' => $item['nama'],
                'email' => $item['email'],
                'password' => Hash::make($item['password']),
                'role' => 'driver',
                'status' => $item['status'],
            ]);

            Sopir::create([
                'user_id' => $user->id,
                'nama' => $item['nama'],
                'nik' => $item['nik'],
                'alamat' => $item['alamat'],
                'nomor_hp' => $item['nomor_hp'],
                'armada_id' => $item['armada_id'],
                'status' => $item['status'],
            ]);
        }
    }
}
