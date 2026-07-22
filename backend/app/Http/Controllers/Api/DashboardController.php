<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Armada;
use App\Models\Sopir;
use App\Models\Monitoring;
use App\Models\Tracking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_armada' => Armada::count(),
            'armada_aktif' => Armada::where('status', 'aktif')->count(),
            'jumlah_sopir' => Sopir::count(),
            'pengangkutan_hari_ini' => Monitoring::whereDate('tanggal', today())->count(),
            'volume_sampah_hari_ini' => (float) Monitoring::whereDate('tanggal', today())->sum('volume_sampah'),
            'total_pengangkutan_bulan_ini' => Monitoring::whereMonth('tanggal', now()->month)
                ->whereYear('tanggal', now()->year)->count(),
            'total_tps' => 12,
        ]);
    }

    public function volumePerHari()
    {
        $data = Monitoring::selectRaw('DATE(tanggal) as tanggal, SUM(volume_sampah) as volume')
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return response()->json($data);
    }

    public function pengangkutanPerBulan()
    {
        $data = Monitoring::selectRaw("DATE_FORMAT(tanggal, '%Y-%m') as bulan, COUNT(*) as jumlah")
            ->whereYear('tanggal', now()->year)
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        return response()->json($data);
    }

    public function aktivitasTerbaru()
    {
        $data = Monitoring::with('sopir')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'armada_plat' => $m->plat_nomor,
                    'sopir_nama' => $m->sopir->nama ?? '-',
                    'volume' => (float) $m->volume_sampah,
                    'status' => $m->status,
                    'waktu' => $m->created_at->diffForHumans(),
                ];
            });

        return response()->json($data);
    }

    public function armadaAktif()
    {
        $data = Tracking::with('armada')
            ->whereHas('armada', function($q) {
                $q->where('status', 'aktif');
            })
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'plat_nomor' => $t->plat_nomor,
                    'sopir_nama' => $t->sopir_nama,
                    'latitude' => (float) $t->latitude,
                    'longitude' => (float) $t->longitude,
                    'volume_sampah' => (float) $t->volume_sampah,
                    'update_terakhir' => $t->update_terakhir ? $t->update_terakhir->diffForHumans() : '-',
                ];
            });

        return response()->json($data);
    }
}
