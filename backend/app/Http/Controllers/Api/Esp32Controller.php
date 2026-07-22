<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Armada;
use App\Models\Tracking;
use App\Models\Monitoring;
use Illuminate\Http\Request;

class Esp32Controller extends Controller
{
    public function updateTracking(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string|exists:armada,plat_nomor',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $armada = Armada::where('plat_nomor', $request->plat_nomor)->first();
        $sopir = $armada->sopir;

        Tracking::updateOrCreate(
            ['armada_id' => $armada->id],
            [
                'plat_nomor' => $armada->plat_nomor,
                'sopir_nama' => $sopir?->nama ?? '-',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'update_terakhir' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Posisi armada berhasil diperbarui.',
        ]);
    }

    public function updateVolume(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string|exists:armada,plat_nomor',
            'tinggi_sampah' => 'required|numeric|min:0',
        ]);

        $armada = Armada::where('plat_nomor', $request->plat_nomor)->first();

        $panjang = $armada->panjang_bak;
        $lebar = $armada->lebar_bak;
        $tinggiSampah = $request->tinggi_sampah;

        $volume = ($panjang * $lebar * $tinggiSampah) / 1000000;
        $volume = round($volume, 2);

        Tracking::where('armada_id', $armada->id)
            ->update(['volume_sampah' => $volume, 'update_terakhir' => now()]);

        $lastMonitoring = Monitoring::where('armada_id', $armada->id)
            ->whereDate('tanggal', today())
            ->latest()
            ->first();

        if ($lastMonitoring) {
            $lastMonitoring->update(['volume_sampah' => $volume]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Volume sampah berhasil diperbarui.',
            'data' => [
                'plat_nomor' => $armada->plat_nomor,
                'tinggi_sampah' => $tinggiSampah,
                'volume_sampah' => $volume,
            ],
        ]);
    }
}
