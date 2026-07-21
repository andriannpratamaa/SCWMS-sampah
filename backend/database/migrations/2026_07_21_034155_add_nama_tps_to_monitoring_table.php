<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('monitoring', function (Blueprint $table) {
            $table->string('nama_tps', 100)->nullable()->after('jenis_armada');
        });
    }

    public function down(): void
    {
        Schema::table('monitoring', function (Blueprint $table) {
            $table->dropColumn('nama_tps');
        });
    }
};
