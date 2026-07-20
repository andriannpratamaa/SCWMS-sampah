<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('armada_id');
            $table->string('sopir_nama', 100);
            $table->string('plat_nomor', 20);
            $table->float('latitude', 10, 8);
            $table->float('longitude', 11, 8);
            $table->float('volume_sampah', 10, 2)->default(0);
            $table->timestamp('update_terakhir');
            $table->timestamps();

            $table->foreign('armada_id')->references('id')->on('armada')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking');
    }
};
