<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitoring;
use App\Models\Sopir;
use App\Models\Tps;
use App\Models\Tracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class DriverController extends Controller
{
    private function getSopir(Request $request): Sopir
    {
        $user = $request->user();
        $sopir = Sopir::with('armada')->where('user_id', $user->id)->first();

        if (!$sopir) {
            abort(404, 'Data sopir tidak ditemukan.');
        }

        return $sopir;
    }

    public function dashboard(Request $request)
    {
        $sopir = $this->getSopir($request);
        $user = $request->user();

        $today = now()->toDateString();
        $monitoringHariIni = Monitoring::where('sopir_id', $sopir->id)
            ->whereDate('tanggal', $today)
            ->count();
        $volumeHariIni = round((float) Monitoring::where('sopir_id', $sopir->id)
            ->whereDate('tanggal', $today)
            ->sum('volume_sampah'), 2);

        $tracking = null;
        if ($sopir->armada) {
            $latest = Tracking::where('armada_id', $sopir->armada_id)
                ->latest('update_terakhir')
                ->first();
            if ($latest) {
                $tracking = [
                    'latitude' => (float) $latest->latitude,
                    'longitude' => (float) $latest->longitude,
                    'volume_sampah' => (float) $latest->volume_sampah,
                    'update_terakhir' => $latest->update_terakhir,
                    'is_online' => $latest->update_terakhir && $latest->update_terakhir->diffInMinutes(now()) < 5,
                ];
            }
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'foto_profil' => $user->foto_profil,
                'role' => $user->role,
            ],
            'sopir' => [
                'id' => $sopir->id,
                'nama' => $sopir->nama,
                'nik' => $sopir->nik,
                'alamat' => $sopir->alamat,
                'nomor_hp' => $sopir->nomor_hp,
                'armada_id' => $sopir->armada_id,
                'armada' => $sopir->armada ? [
                    'id' => $sopir->armada->id,
                    'plat_nomor' => $sopir->armada->plat_nomor,
                    'merk_kendaraan' => $sopir->armada->merk_kendaraan,
                    'jenis_armada' => $sopir->armada->jenis_armada,
                    'tahun_pembelian' => $sopir->armada->tahun_pembelian,
                    'volume_bak' => $sopir->armada->volume_bak,
                ] : null,
            ],
            'tracking' => $tracking,
            'statistik' => [
                'monitoring_hari_ini' => $monitoringHariIni,
                'volume_hari_ini' => $volumeHariIni,
                'total_monitoring' => Monitoring::where('sopir_id', $sopir->id)->count(),
            ],
        ]);
    }

    public function monitorings(Request $request)
    {
        $sopir = $this->getSopir($request);

        $query = Monitoring::with('armada')
            ->where('sopir_id', $sopir->id)
            ->orderBy('created_at', 'desc');

        $perPage = $request->per_page ?? 10;
        return response()->json($query->paginate($perPage));
    }

    public function showMonitoring($id, Request $request)
    {
        $sopir = $this->getSopir($request);
        $monitoring = Monitoring::with('armada')
            ->where('sopir_id', $sopir->id)
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $monitoring]);
    }

    public function storeMonitoring(Request $request)
    {
        $sopir = $this->getSopir($request);

        $validated = $request->validate([
            'nama_tps' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'volume_sampah' => 'required|numeric|min:0',
            'status' => 'required|in:terangkut,tidak_terangkut',
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $uploaded = Cloudinary::upload($request->file('foto')->getRealPath(), [
            'folder' => 'scwms/foto-monitoring',
        ]);
        $fotoPath = $uploaded->getSecurePath();

        $monitoring = Monitoring::create([
            'tanggal' => now()->toDateString(),
            'jam' => now()->format('H:i:s'),
            'plat_nomor' => $sopir->armada?->plat_nomor ?? '-',
            'armada_id' => $sopir->armada_id,
            'sopir_id' => $sopir->id,
            'jenis_armada' => $sopir->armada?->jenis_armada ?? '-',
            'nama_tps' => $validated['nama_tps'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'volume_sampah' => $validated['volume_sampah'],
            'status' => $validated['status'],
            'foto' => $fotoPath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Monitoring berhasil dikirim.',
            'data' => $monitoring->load('armada'),
        ], 201);
    }

    public function tpsList()
    {
        $tps = Tps::orderBy('nama')->get(['id', 'nama']);

        return response()->json($tps);
    }

    public function tpsStore(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100|unique:tps,nama',
        ]);

        $tps = Tps::create(['nama' => $request->nama]);

        return response()->json(['success' => true, 'data' => $tps], 201);
    }

    public function tpsUpdate($id, Request $request)
    {
        $tps = Tps::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:100|unique:tps,nama,' . $id,
        ]);

        $tps->update(['nama' => $request->nama]);

        return response()->json(['success' => true, 'data' => $tps]);
    }

    public function tpsDestroy($id)
    {
        $tps = Tps::findOrFail($id);
        $tps->delete();

        return response()->json(['success' => true, 'message' => 'TPS berhasil dihapus.']);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password_lama' => 'required',
            'password_baru' => 'required|min:6',
            'konfirmasi_password' => 'required|same:password_baru',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password_lama, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama salah.',
            ], 400);
        }

        $user->password = Hash::make($request->password_baru);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.',
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto_profil' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();
        $uploaded = Cloudinary::upload($request->file('foto_profil')->getRealPath(), [
            'folder' => 'scwms/foto-profil',
        ]);
        $user->foto_profil = $uploaded->getSecurePath();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diperbarui.',
            'data' => ['foto_profil' => $uploaded->getSecurePath()],
        ]);
    }
}
