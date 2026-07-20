<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Monitoring</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 10px; }
        th { background: #16A34A; color: white; font-weight: bold; }
        tr:nth-child(even) { background: #f9f9f9; }
        .footer { margin-top: 20px; text-align: right; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <h1>SCWMS - Smart City Waste Monitoring System</h1>
    <p class="subtitle">Laporan Monitoring Pengangkutan Sampah</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Plat Nomor</th>
                <th>Sopir</th>
                <th>Volume (m³)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $d)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $d->tanggal }}</td>
                <td>{{ $d->jam }}</td>
                <td>{{ $d->plat_nomor }}</td>
                <td>{{ $d->sopir->nama ?? '-' }}</td>
                <td>{{ number_format($d->volume_sampah, 2) }}</td>
                <td>{{ $d->status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
