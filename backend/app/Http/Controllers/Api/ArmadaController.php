<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Armada;
use Illuminate\Http\Request;

class ArmadaController extends Controller
{
    public function index(Request $request)
    {
        $query = Armada::query();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('plat_nomor', 'like', "%{$request->search}%")
                  ->orWhere('merk_kendaraan', 'like', "%{$request->search}%");
            });
        }

        $sortBy = $request->sort_by ?? 'plat_nomor';
        $sortOrder = $request->sort_order ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->per_page ?? 10;
        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        $armada = Armada::findOrFail($id);
        return response()->json(['success' => true, 'data' => $armada]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plat_nomor' => 'required|unique:armada',
            'merk_kendaraan' => 'required',
            'jenis_armada' => 'required|in:Truck,Armroll',
            'tahun_pembelian' => 'required|integer|min:2000|max:2030',
            'panjang_bak' => 'required|numeric|min:1',
            'lebar_bak' => 'required|numeric|min:1',
            'tinggi_bak' => 'required|numeric|min:1',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        $armada = Armada::create($validated);
        return response()->json(['success' => true, 'data' => $armada], 201);
    }

    public function update(Request $request, $id)
    {
        $armada = Armada::findOrFail($id);

        $validated = $request->validate([
            'plat_nomor' => 'required|unique:armada,plat_nomor,' . $id,
            'merk_kendaraan' => 'required',
            'jenis_armada' => 'required|in:Truck,Armroll',
            'tahun_pembelian' => 'required|integer|min:2000|max:2030',
            'panjang_bak' => 'required|numeric|min:1',
            'lebar_bak' => 'required|numeric|min:1',
            'tinggi_bak' => 'required|numeric|min:1',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        $armada->update($validated);
        return response()->json(['success' => true, 'data' => $armada]);
    }

    public function destroy($id)
    {
        $armada = Armada::findOrFail($id);
        $armada->delete();
        return response()->json(['success' => true, 'message' => 'Armada berhasil dihapus.']);
    }
}
```

Wait, the DashboardController has a bug - `$armada` is not defined in the `update` method. Let me check the user's provided code... Actually, looking at the user's provided code for DashboardController, it doesn't have update/destroy methods. The user only provided the code as shown. Let me re-read the user's request.

The user provided the exact code for each file. I should write them exactly as provided. Let me write all 7 files.</think>

<｜DSML｜tool_calls>
<｜DSML｜invoke name="write">
<｜DSML｜parameter name="filePath" string="true">C:\ELMECH2026\SCWMS\backend\app\Http\Controllers\Api\ArmadaController.php