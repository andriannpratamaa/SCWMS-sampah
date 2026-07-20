<?php

namespace Database\Seeders;

use App\Models\Armada;
use Illuminate\Database\Seeder;

class ArmadaSeeder extends Seeder
{
    public function run(): void
    {
        $armadas = [
            ['plat_nomor' => 'B 1234 ABC', 'merk_kendaraan' => 'Mitsubishi Colt Diesel', 'jenis_armada' => 'Truck', 'tahun_pembelian' => 2020, 'panjang_bak' => 400, 'lebar_bak' => 200, 'tinggi_bak' => 150, 'status' => 'aktif'],
            ['plat_nomor' => 'B 5678 DEF', 'merk_kendaraan' => 'Isuzu Elf', 'jenis_armada' => 'Armroll', 'tahun_pembelian' => 2021, 'panjang_bak' => 350, 'lebar_bak' => 180, 'tinggi_bak' => 120, 'status' => 'aktif'],
            ['plat_nomor' => 'B 9012 GHI', 'merk_kendaraan' => 'Hino Dutro', 'jenis_armada' => 'Truck', 'tahun_pembelian' => 2022, 'panjang_bak' => 450, 'lebar_bak' => 220, 'tinggi_bak' => 180, 'status' => 'aktif'],
            ['plat_nomor' => 'B 3456 JKL', 'merk_kendaraan' => 'Mitsubishi FE 74', 'jenis_armada' => 'Armroll', 'tahun_pembelian' => 2019, 'panjang_bak' => 380, 'lebar_bak' => 190, 'tinggi_bak' => 130, 'status' => 'tidak_aktif'],
            ['plat_nomor' => 'B 7890 MNO', 'merk_kendaraan' => 'Toyota Dyna', 'jenis_armada' => 'Truck', 'tahun_pembelian' => 2023, 'panjang_bak' => 420, 'lebar_bak' => 210, 'tinggi_bak' => 160, 'status' => 'aktif'],
        ];

        foreach ($armadas as $armada) {
            Armada::create($armada);
        }
    }
}
