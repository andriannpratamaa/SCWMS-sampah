<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArmadaController;
use App\Http\Controllers\Api\SopirController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/volume-per-hari', [DashboardController::class, 'volumePerHari']);
    Route::get('/dashboard/pengangkutan-per-bulan', [DashboardController::class, 'pengangkutanPerBulan']);
    Route::get('/dashboard/aktivitas-terbaru', [DashboardController::class, 'aktivitasTerbaru']);
    Route::get('/dashboard/armada-aktif', [DashboardController::class, 'armadaAktif']);

    // Master Armada
    Route::apiResource('/armada', ArmadaController::class);

    // Master Sopir
    Route::apiResource('/sopir', SopirController::class);

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index']);
    Route::get('/monitoring/{id}', [MonitoringController::class, 'show']);

    // Tracking
    Route::get('/tracking', [TrackingController::class, 'index']);

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/export-excel', [LaporanController::class, 'exportExcel']);
    Route::get('/laporan/export-pdf', [LaporanController::class, 'exportPdf']);

    // Driver routes (driver only)
    Route::middleware('role:driver')->prefix('driver')->group(function () {
        Route::get('/dashboard', [DriverController::class, 'dashboard']);
        Route::get('/monitorings', [DriverController::class, 'monitorings']);
        Route::get('/monitorings/{id}', [DriverController::class, 'showMonitoring']);
        Route::post('/monitorings', [DriverController::class, 'storeMonitoring']);
        Route::get('/tps', [DriverController::class, 'tpsList']);
        Route::put('/password', [DriverController::class, 'updatePassword']);
        Route::post('/photo', [DriverController::class, 'updatePhoto']);
    });

    // User Management (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/users', UserController::class);
    });
});
