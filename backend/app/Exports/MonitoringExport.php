<?php

namespace App\Exports;

use App\Models\Monitoring;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Http\Request;

class MonitoringExport implements FromCollection, WithHeadings, WithMapping
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function collection()
    {
        $query = Monitoring::with(['armada', 'sopir']);

        if ($this->request->tanggal_awal) {
            $query->whereDate('tanggal', '>=', $this->request->tanggal_awal);
        }
        if ($this->request->tanggal_akhir) {
            $query->whereDate('tanggal', '<=', $this->request->tanggal_akhir);
        }
        if ($this->request->armada_id) {
            $query->where('armada_id', $this->request->armada_id);
        }
        if ($this->request->sopir_id) {
            $query->where('sopir_id', $this->request->sopir_id);
        }
        if ($this->request->status) {
            $query->where('status', $this->request->status);
        }

        return $query->orderBy('tanggal', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Tanggal', 'Jam', 'Plat Nomor', 'Nama Sopir', 'Jenis Armada',
            'Latitude', 'Longitude', 'Volume Sampah (m³)', 'Status',
        ];
    }

    public function map($monitoring): array
    {
        return [
            $monitoring->tanggal,
            $monitoring->jam,
            $monitoring->plat_nomor,
            $monitoring->sopir->nama ?? '-',
            $monitoring->jenis_armada,
            $monitoring->latitude,
            $monitoring->longitude,
            (float) $monitoring->volume_sampah,
            $monitoring->status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut',
        ];
    }
}
