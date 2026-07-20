<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tracking extends Model
{
    protected $table = 'tracking';

    protected $fillable = [
        'armada_id', 'sopir_nama', 'plat_nomor',
        'latitude', 'longitude', 'volume_sampah', 'update_terakhir',
    ];

    protected $casts = [
        'update_terakhir' => 'datetime',
    ];

    public function armada()
    {
        return $this->belongsTo(Armada::class);
    }
}
