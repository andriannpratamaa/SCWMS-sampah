<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('armada', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('plat_nomor', 20)->unique();
            $table->string('merk_kendaraan', 100);
            $table->string('jenis_armada');
            $table->string('tahun_pembelian', 4);
            $table->float('panjang_bak', 10, 2);
            $table->float('lebar_bak', 10, 2);
            $table->float('tinggi_bak', 10, 2);
            $table->string('status')->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('armada');
    }
};
