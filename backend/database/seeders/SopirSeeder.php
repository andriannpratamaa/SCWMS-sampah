<?php

namespace Database\Seeders;

use App\Models\Sopir;
use Illuminate\Database\Seeder;

class SopirSeeder extends Seeder
{
    public function run(): void
    {
        $sopirs = [
            ['nama' => 'Ahmad Fauzi', 'nik' => '3174010101900001', 'alamat' => 'Jl. Merdeka No. 1, Jakarta', 'nomor_hp' => '081234567890', 'armada_id' => 1, 'status' => 'aktif'],
            ['nama' => 'Budi Santoso', 'nik' => '3174010101900002', 'alamat' => 'Jl. Sudirman No. 23, Jakarta', 'nomor_hp' => '081234567891', 'armada_id' => 2, 'status' => 'aktif'],
            ['nama' => 'Cecep Hermawan', 'nik' => '3174010101900003', 'alamat' => 'Jl. Gatot Subroto No. 45, Jakarta', 'nomor_hp' => '081234567892', 'armada_id' => 3, 'status' => 'aktif'],
            ['nama' => 'Dwi Prasetyo', 'nik' => '3174010101900004', 'alamat' => 'Jl. Thamrin No. 67, Jakarta', 'nomor_hp' => '081234567893', 'armada_id' => 4, 'status' => 'tidak_aktif'],
            ['nama' => 'Eko Wahyudi', 'nik' => '3174010101900005', 'alamat' => 'Jl. Kuningan No. 89, Jakarta', 'nomor_hp' => '081234567894', 'armada_id' => 5, 'status' => 'aktif'],
        ];

        foreach ($sopirs as $sopir) {
            Sopir::create($sopir);
        }
    }
}
