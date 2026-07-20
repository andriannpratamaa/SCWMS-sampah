<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sopir;
use Illuminate\Http\Request;

class SopirController extends Controller
{
    public function index(Request $request)
    {
        $query = Sopir::with('armada');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%")
                  ->orWhere('nomor_hp', 'like', "%{$request->search}%");
            });
        }

        $sortBy = $request->sort_by ?? 'nama';
        $sortOrder = $request->sort_order ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->per_page ?? 10;
        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        $sopir = Sopir::with('armada')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $sopir]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required',
            'nik' => 'required|size:16|unique:sopir',
            'alamat' => 'required',
            'nomor_hp' => 'required|min:10',
            'armada_id' => 'nullable|exists:armada,id',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        $sopir = Sopir::create($validated);
        return response()->json(['success' => true, 'data' => $sopir->load('armada')], 201);
    }

    public function update(Request $request, $id)
    {
        $sopir = Sopir::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required',
            'nik' => 'required|size:16|unique:sopir,nik,' . $id,
            'alamat' => 'required',
            'nomor_hp' => 'required|min:10',
            'armada_id' => 'nullable|exists:armada,id',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        $sopir->update($validated);
        return response()->json(['success' => true, 'data' => $sopir->load('armada')]);
    }

    public function destroy($id)
    {
        $sopir = Sopir::findOrFail($id);
        $sopir->delete();
        return response()->json(['success' => true, 'message' => 'Sopir berhasil dihapus.']);
    }
}
