<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Monitoring extends Model
{
    protected $table = 'monitoring';

    protected $fillable = [
        'tanggal', 'jam', 'plat_nomor', 'armada_id', 'sopir_id',
        'jenis_armada', 'latitude', 'longitude', 'volume_sampah',
        'status', 'foto',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam' => 'string',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function armada()
    {
        return $this->belongsTo(Armada::class);
    }

    public function sopir()
    {
        return $this->belongsTo(Sopir::class);
    }
}
