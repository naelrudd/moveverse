# IT Architecture Review for MOVEVERSE

---

## Analisis Awal dari Sisi Arsitektur

**Multi-layer architecture-nya make sense** sih. User → Application → AI → Computer Vision → Database → Infrastructure. Ini modular dan scalable. Tapi ada beberapa pertanyaan teknis yang muncul:

**Computer Vision Layer** — Pake MediaPipe + MoveNet + OpenCV. Ini combo yang oke buat real-time pose estimation di browser/mobile. Tapi pertanyaannya: **real-time processing-nya di mana?** Edge (device) atau cloud? Kalo di device, performa smartphone entry-level bisa jadi bottleneck. Kalo di cloud, latency + bandwidth jadi concern—apalagi targetnya SD di Indonesia, banyak yang koneksinya nggak stabil.

**AI Layer** — TensorFlow/PyTorch. Ini generik banget. Yang lebih penting: **model-nya train dari scratch atau fine-tune pre-trained?** Dataset-nya dari mana? Kalo gerak anak SD Indonesia, gerakannya beda sama dataset Western (COCO, etc.). Cultural context + body proportion beda. Ini bisa jadi accuracy issue.

**Backend FastAPI + PostgreSQL** — Solid choice. FastAPI async, PostgreSQL reliable. Tapi untuk **longitudinal analytics** (monitoring perkembangan dari semester ke semester), PostgreSQL aja cukup? Atau perlu data warehouse (BigQuery, etc.) buat analytics heavy?

---

## Yang Agak "Hmm..." dari Sisi Tech Stack

| Komponen | Pilihan | Komentar IT |
|---|---|---|
| Dashboard | Flutter Web | Ini interesting. Flutter web masih agak niche dibanding React/Vue. Performance-nya gimana di low-end device? |
| Cloud | AWS/Google Cloud | Generic, oke. Tapi cost untuk CV processing (GPU instances) bisa gede. |
| Security | JWT + AES | Standard. Tapi data anak-anak → perlu lebih ketat lagi (encryption at rest, in transit, RBAC granular). |

**Flutter Web untuk dashboard** — ini pilihan yang nggak mainstream. Flutter web masih ada issue di:
- Initial load size (bisa gede)
- SEO (kurang relevan sih untuk internal dashboard)
- Plugin web support (belum semua stabil)

Kenapa nggak React/Vue aja? Apa ada alasan spesifik (misal: team udah familiar Flutter, atau mau share codebase sama mobile app)?

---

## Real-World Implementation Concerns

### 1. Device & Infrastructure Reality

Targetnya SD di Indonesia. Realitanya:
- Banyak SD nggak punya perangkat dedicated (tablet/PC)
- Guru PJOK biasanya nggak bawa laptop ke lapangan
- Koneksi internet di lapangan (outdoor) bisa jelek

Solusi yang gw liat di proposal: "smartphone dengan kamera standar". Ini berarti **mobile-first** atau at least **responsive web yang works di mobile browser**. Tapi kalo pake Flutter Web di mobile browser... itu experience-nya bisa tricky.

### 2. Computer Vision di Lapangan

Pose estimation outdoor itu beda sama indoor:
- Lighting variable (matahari, bayangan)
- Background clutter (lapangan, tembok, pohon)
- Multiple kids gerak bareng (occlusion)

MediaPipe works well, tapi kondisi outdoor Indonesia bisa challenge. Perlu robust preprocessing (background subtraction, lighting normalization) atau model yang fine-tune untuk kondisi ini.

### 3. Data Pipeline & Latency

Flow-nya: Video → CV processing → AI Analytics → Recommendation → Dashboard.

Kalo real-time:
> Video stream → keypoint extraction (MediaPipe) → movement classification → scoring → recommendation

Ini butuh **low latency**. Kalo di-run di cloud, tiap frame harus upload? Atau processing di-device, cuma hasilnya yang di-sync?

**Rekomendasi arsitektur yang lebih realistic:**
- **Edge processing**: MediaPipe run di device (smartphone/tablet guru). Cuma hasil analisis (keypoints, scores) yang di-upload.
- **Offline-first**: App bisa kerja tanpa internet, sync pas ada koneksi.
- **Progressive sync**: Data gerak di-cache, di-batch upload.

### 4. AI Model Specifics

Proposal mention "AI Analytics Engine, Recommendation Engine, Prediction Engine". Tapi nggak detail:
- **Recommendation Engine**: Rule-based atau collaborative filtering? Content-based?
- **Prediction Engine**: Prediksi apa? Risk of movement poverty? Time series forecasting?
- **Movement Intelligence**: Ini abstract banget. Secara teknis, ini basically **feature engineering dari movement data** → clustering/classification → personalized recommendation.

---

## Yang Menarik Buat Dikembangin dari Sisi IT

### Movement Intelligence Framework (secara teknis)

```
Data (raw video/keypoints)
  → Analytics (feature extraction: speed, angle, stability, etc.)
  → Insight (classification: emerging/developing/proficient/advanced)
  → Recommendation (rule-based + ML: next activity, difficulty adjustment)
  → Decision (dashboard visualization for teacher)
```

Ini basically **MLOps pipeline** + **feature store** + **recommendation system**. Yang menarik: **feature-nya domain-specific** (FMS metrics), bukan generic CV features.

### Gamification Backend

Badge, level, streak, avatar growth — ini butuh:
- **Gamification engine** (state machine untuk quest/mission)
- **Real-time notification system** (WebSocket/Firebase)
- **Anti-cheat mechanism** (validasi data gerak beneran dari anak, bukan fake)

### Multi-tenant Architecture

Sekolah → Kelas → Siswa. Ini butuh:
- **Tenant isolation** (data sekolah A nggak bisa diakses sekolah B)
- **RBAC** (guru cuma liat kelasnya, admin sekolah liat semua, orang tua cuma anaknya)
- **Data residency** (kalo ada requirement data harus di Indonesia)

---

## Pertanyaan Teknis yang Perlu Dijawab

1. **On-device vs Cloud CV processing** — trade-off accuracy vs accessibility?
2. **Offline capability** — app bisa kerja tanpa internet nggak?
3. **Model training pipeline** — gimana retrain model dengan data baru dari lapangan?
4. **Cost estimation** — kalo 10,000 sekolah pake ini, monthly cloud cost berapa?
5. **Open source strategy** — ada rencana open source sebagian? Bisa accelerate adoption.

---

## Kesimpulan dari Sisi IT

Proposal ini **vision-nya bagus** dan arsitektur high-level-nya oke. Tapi dari sisi IT/Engineering, butuh lebih banyak detail di:
- **Edge computing strategy** (karena infrastruktur Indonesia realitanya)
- **Model specifics** (apa yang di-train, gimana pipeline-nya)
- **Cost & performance optimization** (biar scalable ke ribuan sekolah)
- **Developer experience** (Flutter Web untuk web dashboard masih questionable)

Yang paling krusial: **jangan jadi "AI di PowerPoint"** — banyak proposal inovasi digital yang keren di kertas tapi gagal di implementasi karena nggak consider real-world constraints (device, network, user behavior).

---

## Analisis Tingkat Kesulitan & Cara Mengatasi

> *Berdasarkan review dari chatbot lain, berikut bedah pain point secara brutal jujur dan actionable, dengan pendekatan "engineering for chaos", bukan "engineering for perfect paper".*

**Tingkat kesulitan keseluruhan:**
- Full national scale (10.000+ sekolah): **8.5–9/10** — sangat sulit, butuh tim besar + funding gede + political will
- Prototype + validasi di 5–10 sekolah pilot (TRL 4–6): **5.5–6.5/10** — doable dalam 8–12 bulan kalau tim solid & fokus MVP dulu
- Bikin "AI di PowerPoint" yang cuma jalan di demo lab: **2/10** — gampang, tapi useless

---

### 1. Computer Vision Layer — Real-time Edge vs Cloud (Difficulty: 8/10)

**Masalah utama:** Low-end HP guru + outdoor lighting + multiple kids + bandwidth jelek = recipe for disaster kalau pure cloud.

**Cara mengatasi (realistic hack):**

Hybrid Edge-First (ini yang harus jadi core architecture, bukan optional):
- **Primary processing:** MediaPipe Pose / BlazePose jalan on-device via Flutter (pakai flutter_mediapipe plugin atau compile ke TensorFlow Lite / ONNX Runtime). MediaPipe sekarang sudah sangat mature di mobile (bahkan di HP 2–3 jutaan masih 15–20 FPS di 480p).
- Jangan stream video terus-menerus. Pakai **burst mode**: guru tekan "Mulai Rekam" → rekam 10–20 detik per station (lari, lompat, lempar) → proses lokal → upload hanya keypoints JSON (ukuran super kecil, 5–20 KB per clip).
- **Fallback cloud:** Kalau device terlalu lemah atau confidence score rendah (lighting jelek), kirim short video clip ke cloud queue untuk heavier model.
- **Outdoor robustness:** Tambah preprocessing pipeline (CLAHE untuk lighting, MediaPipe Selfie Segmentation buat crop person, temporal smoothing). Fine-tune model pakai data outdoor Indonesia nanti.
- **Multi-kid occlusion:** Gunakan MediaPipe MultiPose + simple tracking by bounding box + ID.

> **Rekomendasi stack:** Flutter mobile app sebagai "client utama" (bukan Flutter Web untuk camera-heavy part).

---

### 2. AI Model & Dataset — Cultural/Body Proportion Issue (Difficulty: 7/10)

**Masalah:** Dataset COCO / MPII mostly Western adult. Anak SD Indonesia (6–8 th) proporsi tubuh, gerakan, seragam, dan konteks outdoor beda.

**Cara mengatasi:**
- **JANGAN train from scratch.** Fine-tune pre-trained pose model.
- Mulai dengan **synthetic data generation** (Unity/Unreal Engine + Indonesian kid avatars, berbagai lighting, background lapangan tanah/rumput, seragam SD). Ini murah & cepat.
- Lalu kumpulkan real data dari pilot (dengan consent orang tua, anonymized, ethics board approval). Target awal 300–500 video annotated per FMS category.
- **Feature extraction yang domain-specific** jauh lebih penting daripada raw pose: hitung sudut sendi, velocity, acceleration, symmetry, stability, takeoff angle, flight time, dll. Ini yang jadi "Movement Intelligence" beneran.
- **Classification level** (Emerging / Developing / Proficient / Advanced): Bisa pakai simple Random Forest atau small neural net dulu, bukan langsung deep learning monster.

---

### 3. Flutter Web untuk Dashboard (Difficulty: 6/10 — debatable)

**Solusi terbaik — Split architecture (paling recommended):**
- **Flutter** → Mobile app (Student + Teacher camera module) — ini kekuatannya.
- **Next.js / React** + TanStack Table + Recharts → Web dashboard untuk guru, orang tua, sekolah (lebih ringan, ecosystem lebih matang, SEO nggak masalah karena internal).
- Kalau tim sangat Flutter-centric dan mau 1 codebase: Optimasi gila-gilaan (WASM, lazy loading, hindari heavy animation). Tapi tetap risky di low-end browser.
- Alternatif radikal: Gunakan Tauri atau Capacitor + webview buat desktop/web version.

---

### 4. Data Pipeline, Latency & Offline (Difficulty: 7.5/10 — krusial buat Indonesia)

**Must-have — Offline-first + progressive sync:**
- **Local DB:** Hive atau Isar (Flutter) atau SQLite.
- Video/keypoints disimpan lokal dulu → proses → sync background pakai Workmanager / background fetch.
- Hanya upload metadata + keypoints (bukan raw video setiap saat) → hemat bandwidth & storage.
- **Anti-cheat gamification:** Pakai confidence score MediaPipe + anomaly detection sederhana (gerakan terlalu perfect = curang).

---

### 5. Backend, Analytics & Cost (Difficulty: 7/10 untuk scale)

- PostgreSQL + **TimescaleDB extension** sudah cukup kuat untuk longitudinal time-series (bisa handle ribuan siswa).
- Untuk analytics berat nanti: Tambah **ClickHouse** atau sinkronisasi ke BigQuery.
- **Cost control:** Edge-heavy = minimalkan GPU cloud. Gunakan serverless (Cloud Run / AWS Lambda) + spot instances. Mulai pilot dengan budget kecil.
- **Estimasi kasar:** 100 sekolah pilot masih manageable. 10.000 sekolah butuh optimasi gila + kemungkinan hybrid cloud pemerintah/CSR.

---

### 6. Movement Intelligence Framework (Paling Menarik Secara Teknis)

Ini basically MLOps pipeline sederhana:

```
Raw keypoints (on-device)
→ Feature engineering (sudut, kecepatan, stabilitas, symmetry — domain-specific FMS)
→ Classification (rule-based + ML kecil)
→ Recommendation engine (content-based dulu: "next activity yang cocok levelnya")
→ Decision support (dashboard guru)
```

> Mulai rule-based + threshold dulu, baru tambah ML. Jauh lebih explainable buat guru & validasi ahli.

---

### Kesimpulan Brutal & Actionable

**Prioritas MVP (6–9 bulan):**
1. On-device MediaPipe + basic FMS scoring (lari, lompat, lempar) yang akurat di outdoor.
2. Offline-first + sync sederhana.
3. Dashboard guru yang simple & actionable (bukan analytics monster).
4. Validasi dengan 5–10 guru & 100+ siswa beneran.
5. Kumpulkan data lokal untuk fine-tuning.

> Jangan langsung mau full AI magic + gamification + parent dashboard + school analytics sekaligus. Itu cara paling cepat buat gagal di lapangan.

---

## Update: Single Person + Desktop Platform

> **Keputusan:** Target tetap 1 siswa di dalam kamera. Fokus ke individu untuk hasil analisa. Platform awal: Desktop.

**Dampak perubahan ini:**
- Tingkat kesulitan prototype turun drastis: dari ~6/10 → **3.5–4.5/10**
- Single person = MediaPipe Pose single-person mode jauh lebih stabil, cepat, dan akurat
- Desktop = resolusi lebih tinggi (720p/1080p), FPS lebih stabil, processing power lebih predictable

---

### Rekomendasi Arsitektur & Stack untuk Desktop Prototype

| Layer | Teknologi yang Direkomendasikan | Alasan |
|---|---|---|
| Computer Vision | MediaPipe Pose (Python) | Paling mature, akurat, single-person sangat kuat, mudah di-debug |
| Backend / Processing | Python + FastAPI (atau langsung desktop app) | Cepat development, mudah integrasi MediaPipe |
| UI / Dashboard | Streamlit atau Gradio (MVP) → nanti pindah ke React/Next.js | Super cepat bikin UI untuk testing & validasi |
| Local Storage | SQLite atau Parquet | Cukup untuk prototype |
| Future Mobile | Flutter (nanti) | Tetap rencanakan dari awal |

### Updated Pipeline (Single Person + Desktop)

**Recording Mode (bukan continuous real-time)**
- Guru klik "Mulai Assessment"
- Sistem rekam 8–15 detik (cukup untuk sebagian besar FMS)
- Atau guru bisa pause/resume per gerakan

**On-Device Processing (Desktop)**

MediaPipe Pose → extract keypoints setiap frame → hitung domain-specific features:
- Sudut sendi (knee, hip, shoulder, elbow)
- Velocity & acceleration
- Symmetry (kiri-kanan)
- Stability / balance metrics
- Phase detection (takeoff, flight, landing untuk lompat, dll)

**Scoring & Classification**
- Rule-based dulu (threshold yang divalidasi ahli PJOK)
- Nanti tambah small ML model (Random Forest / XGBoost / small NN)

**Output**
- Visual feedback (skeleton overlay + highlight bagian yang kurang bagus)
- Skor per indikator FMS
- Level (Emerging / Developing / Proficient / Advanced)
- Rekomendasi aktivitas berikutnya

### Target Performa Desktop

| Metrik | Target |
|---|---|
| Resolusi | 720p atau 1080p |
| FPS processing | 20–30 FPS stabil |
| Latency per clip (15 detik) | < 3–5 detik setelah rekaman selesai |
| Akurasi | Dapat di-push lebih tinggi (single person + resolusi bagus) |

**Tips performa:**
- Pakai `model_complexity=1` atau `2` di MediaPipe
- Gunakan `min_detection_confidence` dan `min_tracking_confidence` yang agak tinggi (0.7–0.8)
- Proses dalam batch (bukan frame-by-frame realtime) untuk akurasi lebih baik

---

## Tech Stack Final + Pertanyaan Presentasi

### Tech Stack Rekomendasi (Desktop Prototype)

| Layer | Teknologi | Alasan Utama |
|---|---|---|
| Computer Vision | MediaPipe Pose (Python) | Single person mode sangat akurat & stabil, development cepat, open source |
| Bahasa & Processing | Python 3.10+ | Paling cocok sama MediaPipe, mudah feature extraction, cepat prototyping |
| UI / Demo | Streamlit | Paling cepat bikin dashboard interaktif + live demo yang kelihatan keren di presentasi |
| Storage | SQLite + Parquet | Ringan, cukup untuk prototype, mudah diekspor |
| Visualisasi | OpenCV + Plotly | Skeleton overlay real-time + grafik yang bagus |
| Future Mobile | Flutter | Sudah direncanakan dari awal (bisa port logic nanti) |

---

### Pertanyaan yang Mungkin Ditanyakan (Presentasi)

**A. Pertanyaan tentang Tech Stack & Pilihan**

| No | Pertanyaan | Jawaban Siap |
|---|---|---|
| 1 | Kenapa pakai MediaPipe? Kenapa nggak OpenPose atau MoveNet? | MediaPipe paling mature untuk single-person, ringan, cross-platform, dan akurasinya sudah sangat baik untuk kasus pendidikan. Kami pilih karena balance antara akurasi, kecepatan, dan kemudahan deployment. |
| 2 | Kenapa desktop dulu? Bukannya targetnya mobile? | Kami pakai pendekatan phased development. Desktop lebih cepat untuk validasi akurasi & feature extraction. Setelah solid, baru di-port ke Flutter untuk mobile. Ini lebih efisien daripada langsung mobile dan stuck. |
| 3 | Kenapa Streamlit? Bukan React atau Flutter langsung? | Streamlit dipilih karena kecepatan development prototype. Kami butuh cepat validasi dengan ahli PJOK dan siswa. Nanti untuk production version, kami rencanakan pakai Flutter. |
| 4 | Bagaimana dengan performa di perangkat low-end nanti? | Karena sekarang single-person + desktop validation dulu, kami bisa optimasi model dan pipeline dengan baik. Nanti di mobile akan pakai model yang lebih ringan (quantized) + processing on-device. |

**B. Pertanyaan tentang Arsitektur & Real-world**

| No | Pertanyaan | Jawaban Siap |
|---|---|---|
| 5 | Bagaimana kalau di sekolah nggak ada laptop? Hanya HP guru? | Ini memang tantangan. Makanya kami pakai hybrid approach — desktop untuk development & validasi, tapi architecture-nya didesain portable supaya nanti bisa jalan di mobile (Flutter). |
| 6 | Apakah real-time atau record dulu? | Untuk akurasi lebih tinggi, kami pakai burst recording (rekam 8–15 detik) lalu proses. Real-time continuous kurang cocok untuk asesmen kualitas gerak. |
| 7 | Bagaimana menjamin akurasi hasilnya? | Kami akan validasi dengan ahli PJOK menggunakan Delphi method + uji coba lapangan. Selain itu, feature extraction kami buat domain-specific (bukan cuma pose estimation doang). |

**C. Pertanyaan Sulit / Jebakan**

| No | Pertanyaan Jebakan | Jawaban yang Bagus |
|---|---|---|
| 8 | Dataset-nya dari mana? | Saat ini kami gunakan kombinasi synthetic data + data yang akan dikumpulkan dari pilot. Kami sadar dataset lokal penting, makanya fase awal fokus validasi dulu sebelum scale. |
| 9 | Kalau sinyal jelek gimana? | Karena single person + desktop dulu, processing utama on-device. Nanti di mobile juga akan offline-first (proses lokal, sync kalau ada koneksi). |
| 10 | Apa bedanya dengan CAPL atau PLAY Tools? | CAPL & PLAY Tools manual & subjektif. MOVEVERSE pakai computer vision + Movement Intelligence Framework yang bisa kasih insight personal & rekomendasi otomatis. |

---

## Web vs APK — Perbandingan

| Aspek | Web (Streamlit / Next.js) | APK Android (Flutter) | Pemenang |
|---|---|---|---|
| Kemudahan akses guru | Harus buka browser + izinkan kamera | Tinggal buka app | APK |
| Performa Computer Vision | Sedang (tergantung browser) | Sangat baik (native) | APK |
| Offline capability | Bisa (PWA), tapi ribet | Sangat bagus (bisa full offline) | APK |
| Kemudahan install di sekolah | Mudah (tinggal buka link) | Sedikit lebih ribet (harus install) | Web |
| Kualitas rekaman & analisis | Cukup | Lebih stabil & akurat | APK |
| Pengalaman guru di lapangan | Kurang nyaman | Lebih nyaman (seperti app biasa) | APK |
| Update & maintenance | Sangat mudah | Sedikit lebih susah | Web |
| Cocok buat orang tua & sekolah dashboard | Sangat bagus | Kurang optimal | Web |
| Realita SD Indonesia | Banyak guru males buka browser | Guru biasanya pakai HP sendiri | APK |

**Strategi terbaik (phased):**

| Fase | Format | Keterangan |
|---|---|---|
| Prototype sekarang | Web (Streamlit) | Cepat dibuat, bagus untuk presentasi & validasi |
| Pilot di sekolah | APK Android (Flutter) | Lebih enak dipakai guru di lapangan |
| Produk akhir | Flutter Mobile (APK) + Web Dashboard | Hybrid terbaik |

---

## Hal yang Harus Diperhatikan Saat Development

### 1. Integrasi UI ↔ Computer Vision (Paling Krusial)
- Pastikan UI benar-benar terhubung dengan proses MediaPipe, bukan cuma tampilan doang.
- Cek alur datanya: Kamera nyala → MediaPipe jalan → keypoints diekstrak → fitur dihitung → skor muncul di UI

### 2. Kualitas Feature Extraction (Jantung Sistemnya)
- Jangan cuma puas karena skeleton muncul.
- Yang harus sudah dihitung: sudut sendi, velocity, acceleration, symmetry (kiri-kanan), stability?
- Apakah metrik ini konsisten antar frame?
- Apakah bisa membedakan gerakan yang bagus vs kurang bagus secara kasat mata?

### 3. Single Person Handling
- MediaPipe jalan di mode single person (lebih cepat & stabil)
- Ada pengecekan kalau tiba-tiba ada 2 orang masuk frame → kasih warning atau tolak
- Background clutter & lighting variation tetap ditangani (preprocessing sederhana)

### 4. Performa di Desktop
- FPS stabil berapa? (Target minimal 15-20 FPS saat proses)
- Latency dari selesai rekam sampai hasil keluar (idealnya di bawah 5 detik untuk 10-15 detik rekaman)
- Memory usage (jangan boros)

### 5. Data Logging & Export (Sangat Penting untuk Validasi)
- Simpan: video clip (opsional), keypoints, fitur yang dihitung, skor, timestamp
- Format yang mudah dibaca (JSON atau CSV)
- Bisa diekspor per siswa / per sesi

### 6. Error Handling & Edge Case
- Apa yang terjadi kalau lighting jelek?
- Kalau siswa gerak terlalu cepat / blur?
- Kalau kamera tiba-tiba mati?
- Kalau siswa keluar frame sebentar?

### 7. Struktur Kode & Future-Proofing
- Pisahkan logic Computer Vision & feature extraction dari UI sebisa mungkin
- Buat fungsi-fungsi yang reusable (contoh: `calculate_knee_angle()`, `get_symmetry_score()`)
- Jangan hardcode terlalu banyak di UI layer

---

## Setup Guide — Streamlit + Python + MediaPipe (Desktop)

### Spesifikasi Laptop
- RAM: 16GB DDR5
- Drive C: ~4GB sisa (sempit) → **Semua development di Drive D**
- Drive D: ~50GB sisa
- Python: 3.13.x (perlu diperhatikan — MediaPipe paling stabil di Python 3.9–3.12)

> **Catatan:** Python 3.13 masih relatif baru dan ada kemungkinan compatibility issue dengan MediaPipe. Siapkan rencana B kalau nanti ada error.

---

### Langkah Setup (Ikuti Urut)

**Langkah 1: Buat Folder Project di Drive D**

```bash
D:
mkdir moveverse-prototype
cd moveverse-prototype
```

**Langkah 2: Buat Virtual Environment**

```bash
python -m venv venv
```

**Langkah 3: Aktifkan Virtual Environment**

```bash
venv\Scripts\activate
```

Kalau berhasil, di awal baris akan muncul:
```
(venv) D:\moveverse-prototype>
```

> **Penting:** Setiap kali buka Command Prompt baru, lo harus aktifkan venv dulu.

**Langkah 4: Buat File `requirements.txt`**

```
streamlit
opencv-python
mediapipe
numpy
pandas
plotly
```

**Langkah 5: Install Library (Satu Per Satu)**

```bash
pip install streamlit
pip install opencv-python
pip install mediapipe
pip install numpy pandas plotly
```

---

### Struktur Folder Project

```
moveverse-prototype/
├── app.py                    # File utama Streamlit
├── requirements.txt
├── core/
│   ├── __init__.py
│   ├── pose_detector.py      # MediaPipe handler
│   ├── feature_extractor.py  # Hitung sudut, velocity, symmetry, dll
│   └── scoring.py            # Logika penilaian
├── utils/
│   ├── video_utils.py
│   └── logger.py
├── assets/                   # Gambar, icon, background
└── data/                     # Hasil rekaman & skor (nanti)
```

---

### Test Pertama — Kamera di Streamlit

Buat file `app.py` dengan isi berikut:

```python
import streamlit as st
import cv2

st.title("MOVEVERSE - Test Kamera")

run = st.checkbox("Nyalakan Kamera")

FRAME_WINDOW = st.image([])

camera = cv2.VideoCapture(0)

while run:
    _, frame = camera.read()
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    FRAME_WINDOW.image(frame)
else:
    st.write("Kamera dimatikan")
```

Jalankan dengan:

```bash
streamlit run app.py
```

---

### Roadmap Development

| Tahap | Apa yang Dikerjakan | Estimasi Waktu | Prioritas |
|---|---|---|---|
| 1 | Setup project + install library | 1 hari | Tinggi |
| 2 | Bikin MediaPipe jalan di Streamlit (kamera + skeleton) | 2–3 hari | Tinggi |
| 3 | Buat modul Feature Extraction | 4–7 hari | Sangat Tinggi |
| 4 | Hubungkan hasil ke UI Streamlit | 2–3 hari | Tinggi |
| 5 | Tambah scoring sederhana | 3–4 hari | Tinggi |
| 6 | Tambah fitur simpan data | 2 hari | Sedang |
| 7 | Testing & perbaikan bug | Ongoing | - |

---

*MOVEVERSE punya potensi ngubah PJOK di Indonesia dari "main bola doang" jadi data-driven physical literacy ecosystem. Tapi kuncinya satu: jangan biarin ini cuma wet dream di dokumen. Eksekusi engineering yang sadar realita = game changer.*
