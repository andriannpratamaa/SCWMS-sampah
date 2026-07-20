<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitoring;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MonitoringExport;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $query = Monitoring::with(['armada', 'sopir']);

        if ($request->tanggal_awal) {
            $query->whereDate('tanggal', '>=', $request->tanggal_awal);
        }
        if ($request->tanggal_akhir) {
            $query->whereDate('tanggal', '<=', $request->tanggal_akhir);
        }
        if ($request->armada_id) {
            $query->where('armada_id', $request->armada_id);
        }
        if ($request->sopir_id) {
            $query->where('sopir_id', $request->sopir_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $query->orderBy('tanggal', 'desc')->orderBy('jam', 'desc');

        return response()->json($query->get());
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new MonitoringExport($request), 'laporan-monitoring.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $query = Monitoring::with(['armada', 'sopir']);

        if ($request->tanggal_awal) {
            $query->whereDate('tanggal', '>=', $request->tanggal_awal);
        }
        if ($request->tanggal_akhir) {
            $query->whereDate('tanggal', '<=', $request->tanggal_akhir);
        }
        if ($request->armada_id) {
            $query->where('armada_id', $request->armada_id);
        }
        if ($request->sopir_id) {
            $query->where('sopir_id', $request->sopir_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $data = $query->orderBy('tanggal', 'desc')->get();

        $pdf = Pdf::loadView('exports.laporan-pdf', ['data' => $data]);
        return $pdf->download('laporan-monitoring.pdf');
    }
}
