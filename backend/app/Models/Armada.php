<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Armada extends Model
{
    protected $table = 'armada';

    protected $fillable = [
        'plat_nomor', 'merk_kendaraan', 'jenis_armada', 'tahun_pembelian',
        'panjang_bak', 'lebar_bak', 'tinggi_bak', 'status',
    ];

    public function getVolumeBakAttribute(): float
    {
        return ($this->panjang_bak * $this->lebar_bak * $this->tinggi_bak) / 1000000;
    }

    public function sopir()
    {
        return $this->hasOne(Sopir::class);
    }

    public function monitorings()
    {
        return $this->hasMany(Monitoring::class);
    }

    public function tracking()
    {
        return $this->hasOne(Tracking::class);
    }
}
