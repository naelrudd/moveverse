# Panduan Pembuatan Dataset MOVEVERSE

---

## Tujuan

Kumpulkan data gerakan siswa SD untuk:
1. **Validasi scoring** — pastikan aturan rule-based akurat
2. **Training ML** — nanti bisa ganti rule-based → ML model
3. **Fine-tuning MediaPipe** — optimasi untuk kondisi outdoor Indonesia

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

| Field | Keterangan |
|---|---|
| video_file | .mp4, 720p, 15-30 detik |
| siswa_id | ID anonim (A001, A002, dst) |
| gerakan | menekuk / meliuk / memutar / keseimbangan |
| level | 1-5 |
| skor_manual | 0-100 (penilaian guru PJOK) |
| kondisi | indoor / outdoor |
| device | hp_model / laptop_model |
| catatan | hal yang mempengaruhi kualitas |

---

## Spesifikasi Video

### Hardware
- **Minimum**: HP kamera 720p
- **Ideal**: HP kamera 1080p atau laptop webcam
- **Tanpa stabilizer** (realistis seperti guru di lapangan)

### Setting
- **Posisi kamera**: statis, sejajar dada siswa, jarak 2-3 meter
- **Pencahayaan**: alami (outdoor) atau lampu ruangan (indoor)
- **Background**: lapangan, aula, atau ruang kelas
- **Satu siswa per frame** (tidak boleh ada orang lain)

### Format
- **Resolusi**: 720p (1280×720) atau 1080p (1920×1080)
- **FPS**: 30 fps
- **Durasi**: 10-20 detik per gerakan
- **Orientation**: portrait (vertikal) — seperti HP guru merekam
- **Format**: .mp4 (H.264)

### Durasi Per Gerakan

| Level | Durasi Rekaman | Catatan |
|---|---|---|
| Lv 1-2 | 10-15 detik | Gerakan statis (hold position) |
| Lv 3-4 | 15-20 detik | Gerakan repetisi (3-5 rep) |
| Lv 5 | 15-20 detik | Gerakan dinamis / cepat |

---

## Proses Pengumpulan

### Langkah 1: Persiapan (1 hari)
1. Siapkan 10-20 siswa relawan (dengan izin orang tua)
2. Siapkan formulir consent orang tua
3. Siapkan HP/laptop untuk merekam
4. Siapkan rubrik penilaian guru PJOK

### Langkah 2: Rekam Video (2-3 hari)
1. Siswa melakukan gerakan satu per satu
2. Guru PJOK merekam + memberi skor manual secara langsung
3. Setelah selesai, isi metadata (gerakan, level, skor, kondisi)
4. Simpan video + metadata di folder yang terstruktur

### Langkah 3: Annotasi (1-2 hari)
1. Review semua video
2. Pastikan setiap video punya skor manual dari guru
3. Tandai video yang buruk kualitasnya (lighting, blur, dll)
4. Hitung jumlah data per kategori

### Langkah 4: Upload ke Convex (1 hari)
1. Upload metadata ke movements table
2. Upload video ke storage (Convex blob atau cloud storage)
3. Link video ke metadata

---

## Struktur Folder

```
dataset-moveverse/
├── README.md
├── metadata.csv                    # Semua metadata video
├── videos/
│   ├── menekuk/
│   │   ├── lv1/                    # Level 1
│   │   │   ├── A001_lv1_001.mp4
│   │   │   ├── A001_lv1_001.json  # Metadata
│   │   │   └── ...
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

## metadata.csv Format

```csv
video_id,siswa_id,gerakan,level,durasi_detik,kondisi,device,skor_manual,catatan,timestamp
A001_menekuk_lv1_001,A001,menekuk,1,12,outdoor,Samsung A53,75,"lighting bagus",2026-07-04T10:00:00
A001_menekuk_lv2_001,A001,menekuk,2,15,outdoor,Samsung A53,68,"sedikit blur",2026-07-04T10:01:00
```

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

### Do ✅
- Rekam di kondisi berbeda (indoor + outdoor)
- Variasikan device (HP murah + HP bagus + laptop)
- Rekam siswa dengan berbagai postur tubuh
- Guru PJOK kasih skor langsung saat rekaman
- Simpan video asli (jangan kompres ulang)

### Don't ❌
- Jangan rekam lebih dari 1 siswa per frame
- Jangan gunakan tripod stabilizer (realistis)
- Jangan skip level (rekan urut Lv1-5)
- Jangan kasih skor setelah lupa (langsung saat rekaman)
- Jangan hapus video yang "gagal" (tetap simpan untuk training robustness)

---

## Upload ke Convex (Script)

```python
# upload_dataset.py
# Jalankan setelah semua video terkumpul

import csv
import json
from datetime import datetime

# Baca metadata.csv
with open('metadata.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Upload ke Convex via API
        # POST /api/upload_movement
        data = {
            "userId": row["siswa_id"],
            "activityId": f"{row['gerakan']}_L{row['level']}",
            "activity": row["gerakan"],
            "level": int(row["level"]),
            "score": int(row["skor_manual"]),
            "duration": int(row["durasi_detik"]),
            "timestamp": datetime.now().timestamp(),
        }
        print(json.dumps(data, indent=2))
        # requests.post(CONVEX_URL, json=data)
```

---

## Evaluasi Dataset

Setelah terkumpul, cek:

1. **Distribusi level** — apakah semua level punya data yang cukup?
2. **Distribusi kondisi** — indoor vs outdoor seimbang?
3. **Range skor** — ada data dari skor rendah (20) sampai tinggi (100)?
4. **Kualitas video** — berapa % yang blur / lighting jelek?
5. **Konsistensi annotasi** — skor guru konsisten antar video?

---

*Dataset yang baik = data yang terstruktur, terannotasi, dan representatif. Lebih baik 400 video berkualitas daripada 2000 video asal-asalan.*
