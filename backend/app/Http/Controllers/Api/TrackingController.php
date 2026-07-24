<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tracking;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function index()
    {
        $tracking = Tracking::with('armada')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'armada_id' => $t->armada_id,
                'plat_nomor' => $t->plat_nomor,
                'sopir_nama' => $t->sopir_nama,
                'latitude' => (float) $t->latitude,
                'longitude' => (float) $t->longitude,
                'volume_sampah' => (float) $t->volume_sampah,
                'update_terakhir' => $t->update_terakhir ? $t->update_terakhir->toIso8601String() : null,
                'is_online' => $t->update_terakhir && $t->update_terakhir->gt(now()->subMinutes(5)),
                'armada' => $t->armada,
            ];
        });

        return response()->json($tracking);
    }
}
