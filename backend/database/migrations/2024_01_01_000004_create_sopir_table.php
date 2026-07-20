<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sopir', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nama', 100);
            $table->string('nik', 20)->unique();
            $table->string('alamat');
            $table->string('nomor_hp', 20);
            $table->unsignedBigInteger('armada_id')->nullable();
            $table->string('status')->default('aktif');
            $table->timestamps();

            $table->foreign('armada_id')->references('id')->on('armada')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sopir');
    }
};
