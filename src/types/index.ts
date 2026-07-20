export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'operator'
  foto_profil?: string
  status: 'aktif' | 'tidak_aktif'
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface Armada {
  id: number
  plat_nomor: string
  merk_kendaraan: string
  jenis_armada: 'Truck' | 'Armroll'
  tahun_pembelian: number
  panjang_bak: number
  lebar_bak: number
  tinggi_bak: number
  volume_bak: number
  status: 'aktif' | 'tidak_aktif'
  created_at?: string
  updated_at?: string
}

export interface Sopir {
  id: number
  nama: string
  nik: string
  alamat: string
  nomor_hp: string
  armada_id?: number
  armada?: Armada
  status: 'aktif' | 'tidak_aktif'
  created_at?: string
  updated_at?: string
}

export interface Monitoring {
  id: number
  tanggal: string
  jam: string
  plat_nomor: string
  armada?: Armada
  sopir?: Sopir
  jenis_armada: string
  latitude: number
  longitude: number
  volume_sampah: number
  status: 'terangkut' | 'tidak_terangkut'
  foto?: string
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  total_armada: number
  armada_aktif: number
  jumlah_sopir: number
  pengangkutan_hari_ini: number
  volume_sampah_hari_ini: number
  total_pengangkutan_bulan_ini: number
  total_tps: number
}

export interface VolumePerHari {
  tanggal: string
  volume: number
}

export interface PengangkutanPerBulan {
  bulan: string
  jumlah: number
}

export interface AktivitasTerbaru {
  id: number
  armada_plat: string
  sopir_nama: string
  volume: number
  status: string
  waktu: string
}

export interface ArmadaAktif {
  id: number
  plat_nomor: string
  sopir_nama: string
  latitude: number
  longitude: number
  volume_sampah: number
  update_terakhir: string
}

export interface LaporanFilter {
  tanggal_awal?: string
  tanggal_akhir?: string
  armada_id?: number
  sopir_id?: number
  status?: string
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface ChangePasswordPayload {
  password_lama: string
  password_baru: string
  konfirmasi_password: string
}
