<?php

namespace Database\Seeders;

use App\Models\Tracking;
use Illuminate\Database\Seeder;

class TrackingSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'armada_id' => 1,
                'plat_nomor' => 'B 1234 ABC',
                'sopir_nama' => 'Ahmad Fauzi',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'volume_sampah' => 3.5,
                'update_terakhir' => now(),
            ],
            [
                'armada_id' => 2,
                'plat_nomor' => 'B 5678 DEF',
                'sopir_nama' => 'Budi Santoso',
                'latitude' => -6.2146,
                'longitude' => 106.8319,
                'volume_sampah' => 2.8,
                'update_terakhir' => now()->subMinutes(5),
            ],
            [
                'armada_id' => 3,
                'plat_nomor' => 'B 9012 GHI',
                'sopir_nama' => 'Cecep Hermawan',
                'latitude' => -6.2254,
                'longitude' => 106.8126,
                'volume_sampah' => 4.2,
                'update_terakhir' => now()->subMinutes(12),
            ],
            [
                'armada_id' => 5,
                'plat_nomor' => 'B 7890 MNO',
                'sopir_nama' => 'Eko Wahyudi',
                'latitude' => -6.1957,
                'longitude' => 106.8589,
                'volume_sampah' => 1.9,
                'update_terakhir' => now()->subMinutes(3),
            ],
        ];

        foreach ($data as $item) {
            Tracking::create($item);
        }
    }
}
