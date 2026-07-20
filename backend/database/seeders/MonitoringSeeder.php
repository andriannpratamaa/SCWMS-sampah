<?php

namespace Database\Seeders;

use App\Models\Monitoring;
use Illuminate\Database\Seeder;

class MonitoringSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        for ($day = 6; $day >= 0; $day--) {
            $date = $now->copy()->subDays($day)->format('Y-m-d');

            Monitoring::create([
                'tanggal' => $date,
                'jam' => '08:30:00',
                'plat_nomor' => 'B 1234 ABC',
                'armada_id' => 1,
                'sopir_id' => 1,
                'jenis_armada' => 'Truck',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'volume_sampah' => rand(10, 50) / 10,
                'status' => 'terangkut',
            ]);

            Monitoring::create([
                'tanggal' => $date,
                'jam' => '10:15:00',
                'plat_nomor' => 'B 5678 DEF',
                'armada_id' => 2,
                'sopir_id' => 2,
                'jenis_armada' => 'Armroll',
                'latitude' => -6.2146,
                'longitude' => 106.8319,
                'volume_sampah' => rand(10, 40) / 10,
                'status' => 'terangkut',
            ]);

            Monitoring::create([
                'tanggal' => $date,
                'jam' => '13:00:00',
                'plat_nomor' => 'B 9012 GHI',
                'armada_id' => 3,
                'sopir_id' => 3,
                'jenis_armada' => 'Truck',
                'latitude' => -6.2254,
                'longitude' => 106.8126,
                'volume_sampah' => rand(15, 60) / 10,
                'status' => rand(0, 1) ? 'terangkut' : 'tidak_terangkut',
            ]);
        }
    }
}
