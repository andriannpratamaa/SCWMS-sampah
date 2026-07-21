<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sopir extends Model
{
    protected $table = 'sopir';

    protected $fillable = [
        'user_id', 'nama', 'nik', 'alamat', 'nomor_hp', 'armada_id', 'status',
    ];

    public function armada()
    {
        return $this->belongsTo(Armada::class);
    }

    public function monitorings()
    {
        return $this->hasMany(Monitoring::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
