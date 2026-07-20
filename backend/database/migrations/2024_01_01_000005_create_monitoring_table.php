<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('tanggal');
            $table->string('jam');
            $table->string('plat_nomor', 20);
            $table->unsignedBigInteger('armada_id')->nullable();
            $table->unsignedBigInteger('sopir_id')->nullable();
            $table->string('jenis_armada', 50);
            $table->float('latitude', 10, 8);
            $table->float('longitude', 11, 8);
            $table->float('volume_sampah', 10, 2);
            $table->string('status')->default('terangkut');
            $table->string('foto', 255)->nullable();
            $table->timestamps();

            $table->foreign('armada_id')->references('id')->on('armada')->onDelete('set null');
            $table->foreign('sopir_id')->references('id')->on('sopir')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring');
    }
};
