# Panduan Pembuatan Dataset MOVEVERSE

---

## Tujuan

Kumpulkan data gerakan siswa SD untuk:
1. **Validasi penilaian** — pastikan skor otomatis sesuai penilaian guru
2. **Perbaikan sistem** — data ini jadi bahan evaluasi
3. **Dokumentasi** — bukti penilaian digital yang terstruktur

---

## Yang Perlu Dikumpulkan

### Per Gerakan (4 gerakan × 5 level = 20 kategori)

| Gerakan | Level 1-3 | Level 4-5 |
|---|---|---|
| Menekuk (Squat) | Jongkok sederhana → penuh → cepat | Squat jump |
| Meliuk (Lateral Flexion) | Berdiri tegak → berat → dinamis | Cepat bergantian |
| Memutar (Trunk Rotation) | Kepala → lengan → pinggang | Kombinasi cepat |
| Keseimbangan (Single Leg Stance) | Dua kaki → satu kaki → mata tertutup | Tangan terbuka |

### Per Video yang Dikumpulkan

| Informasi | Keterangan |
|---|---|
| Video | Format .mp4, resolusi minimal HD, durasi 15-30 detik |
| ID Siswa | Kode anonim (A001, A002, dst) — jangan pakai nama asli |
| Gerakan | Menekuk / Meliuk / Memutar / Keseimbangan |
| Level | 1-5 |
| Skor Manual | Penilaian guru 0-100 |
| Kondisi | Indoor / Outdoor |
| Device | HP apa yang dipakai merekam |
| Catatan | Hal yang mempengaruhi kualitas rekaman |

---

## Spesifikasi Video

### Peralatan
- **Minimum**: HP dengan kamera jernih (720p ke atas)
- **Ideal**: HP kamera bagus atau laptop dengan webcam
- **Tanpa tripod stabilizer** (supaya realistis seperti guru merekam di lapangan)

### Setting Perekaman
- **Posisi kamera**: diam, sejajar dada siswa, jarak 2-3 meter
- **Pencahayaan**: alami (luar ruangan) atau lampu ruangan
- **Background**: lapangan, aula, atau ruang kelas
- **Satu siswa per frame** — tidak boleh ada orang lain di dalam video

### Format Video
- **Resolusi**: HD (1280×720) atau Full HD (1920×1080)
- **Frame Rate**: 30 fps (supaya gerakan terlihat jelas)
- **Durasi**: 10-20 detik per gerakan
- **Orientasi**: Portrait (vertikal) — seperti HP guru merekam biasanya
- **Format**: .mp4

### Durasi Per Gerakan

| Level | Durasi Rekaman | Catatan |
|---|---|---|
| Lv 1-2 | 10-15 detik | Gerakan statis (tahan posisi) |
| Lv 3-4 | 15-20 detik | Gerakan repetisi (3-5 kali ulang) |
| Lv 5 | 15-20 detik | Gerakan dinamis / cepat |

---

## Proses Pengumpulan

### Langkah 1: Persiapan (1 hari)
1. Siapkan 10-20 siswa relawan (dengan izin orang tua)
2. Siapkan formulir izin orang tua
3. Siapkan HP/laptop untuk merekam
4. Siapkan rubrik penilaian guru

### Langkah 2: Rekam Video (2-3 hari)
1. Siswa melakukan gerakan satu per satu
2. Guru PJOK merekam **sekaligus** memberi skor secara langsung
3. Setelah selesai, isi data pendukung (gerakan, level, skor, kondisi)
4. Simpan video + data di folder yang rapi

### Langkah 3: Review & Validasi (1-2 hari)
1. Tonton ulang semua video
2. Pastikan setiap video punya skor dari guru
3. Tandai video yang kualitasnya kurang bagus (blur, kurang cahaya, dll)
4. Hitung jumlah data per kategori

---

## Struktur Folder

```
dataset-moveverse/
├── README.md
├── metadata.csv                    # Semua data video
├── videos/
│   ├── menekuk/
│   │   ├── lv1/                    # Level 1
│   │   │   ├── A001_lv1_001.mp4
│   │   │   └── A001_lv1_001.json  # Data pendukung
│   │   ├── lv2/
│   │   ├── lv3/
│   │   ├── lv4/
│   │   └── lv5/
│   ├── meliuk/
│   ├── memutar/
│   └── keseimbangan/
├── annotations/                    # Skor manual guru
│   └── skor-manual.csv
└── quality/                        # Kualitas video
    └── quality-check.csv
```

---

## Isi metadata.csv

| Kolom | Isi Contoh |
|---|---|
| video_id | A001_menekuk_lv1_001 |
| siswa_id | A001 |
| gerakan | menekuk |
| level | 1 |
| durasi_detik | 12 |
| kondisi | outdoor |
| device | Samsung A53 |
| skor_manual | 75 |
| catatan | lighting bagus |
| timestamp | 2026-07-04T10:00:00 |

---

## Rubrik Penilaian Manual (Guru PJOK)

### Menekuk (Squat)

| Kriteria | Skor 0-25 | Skor 26-50 | Skor 51-75 | Skor 76-100 |
|---|---|---|---|---|
| Kedalaman jongkok | Tidak turun | Setengah | 3/4 turun | Penuh (paha sejajar lantai) |
| Posisi kaki | Tidak sejajar | Sedikit buka | Sejajar bahu | Sejajar + stabil |
| Keseimbangan | Jatuh/oleng | Sering goyang | Sedikit goyang | Stabil |
| Kecepatan | Terlalu cepat/pelan | Variatif | Konsisten | Kontrol sempurna |

### Meliuk (Lateral Flexion)

| Kriteria | Skor 0-25 | Skor 26-50 | Skor 51-75 | Skor 76-100 |
|---|---|---|---|---|
| Sudut kemiringan | <10° | 10-20° | 20-35° | >35° |
| Keseimbangan | Jatuh | Sering goyang | Sedikit goyang | Stabil |
| Kedua kaki | Sering angkat | Kadang angkat | Jarang angkat | Keduanya menempel |
| Kontrol | Tidak terkendali | Variatif | Konsisten | Penuh kontrol |

### Memutar (Trunk Rotation)

| Kriteria | Skor 0-25 | Skor 26-50 | Skor 51-75 | Skor 76-100 |
|---|---|---|---|---|
| Sudut putaran | <30° | 30-60° | 60-90° | >90° |
| Kestabilan pinggul | Bergerak semua | Sering bergerak | Kadang bergerak | Stabil |
| Kontrol | Tidak terkendali | Variatif | Konsisten | Penuh kontrol |
| Postur | Membungkuk | Sedikit membungkuk | Hampir tegak | Tegak sempurna |

### Keseimbangan (Single Leg Stance)

| Kriteria | Skor 0-25 | Skor 26-50 | Skor 51-75 | Skor 76-100 |
|---|---|---|---|---|
| Waktu bertahan | <3 detik | 3-7 detik | 7-15 detik | >15 detik |
| Kestabilan | Sering goyang | Kadang goyang | Sedikit goyang | Stabil |
| Kaki angkat | Sering turun | Kadang turun | Jarang turun | Tetap di atas |
| Postur tubuh | Miring/oleng | Sedikit miring | Hampir tegak | Tegak sempurna |

---

## Target Jumlah Data

| Kategori | Target Minimum | Target Ideal |
|---|---|---|
| Per level (1 kategori) | 20 video | 50 video |
| Per gerakan (5 level) | 100 video | 250 video |
| Total (4 gerakan) | 400 video | 1000 video |
| Dengan variasi (indoor/outdoor) | 800 video | 2000 video |

---

## Tips Pengumpulan

### Yang Harus Dilakukan ✅
- Rekam di kondisi berbeda (indoor + outdoor)
- Variasikan device (HP murah + HP bagus + laptop)
- Rekam siswa dengan berbagai postur tubuh
- Guru PJOK kasih skor langsung saat rekaman
- Simpan video asli (jangan kompres ulang)

### Yang Tidak Boleh Dilakukan ❌
- Jangan rekam lebih dari 1 siswa per video
- Jangan gunakan tripod stabilizer (supaya realistis)
- Jangan skip level (rekam urut Lv1-5)
- Jangan kasih skor setelah lupa (langsung saat rekaman)
- Jangan hapus video yang "gagal" (tetap simpan untuk evaluasi)

---

## Setelah Terkumpul

Cek kualitas data:

1. **Distribusi level** — apakah semua level punya data yang cukup?
2. **Distribusi kondisi** — indoor vs outdoor seimbang?
3. **Range skor** — ada data dari skor rendah (20) sampai tinggi (100)?
4. **Kualitas video** — berapa % yang blur / kurang cahaya?
5. **Konsistensi skor** — skor guru konsisten antar video?

---

*Dataset yang baik = data yang terstruktur, terannotasi, dan representatif. Lebih baik 400 video berkualitas daripada 2000 video asal-asalan.*
