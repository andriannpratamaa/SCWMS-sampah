<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tps', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100)->unique();
            $table->timestamps();
        });

        DB::statement('INSERT INTO tps (nama, created_at, updated_at) SELECT DISTINCT nama_tps, NOW(), NOW() FROM monitoring WHERE nama_tps IS NOT NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('tps');
    }
};
