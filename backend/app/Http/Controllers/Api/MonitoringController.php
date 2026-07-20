<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitoring;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $query = Monitoring::with(['armada', 'sopir']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('plat_nomor', 'like', "%{$request->search}%")
                  ->orWhereHas('sopir', function($sq) use ($request) {
                      $sq->where('nama', 'like', "%{$request->search}%");
                  });
            });
        }

        $sortBy = $request->sort_by ?? 'tanggal';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->per_page ?? 10;
        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        $monitoring = Monitoring::with(['armada', 'sopir'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $monitoring]);
    }
}
