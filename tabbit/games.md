Fitur game:

**1️⃣ MENEKUK**

| **Level** | **Nama Misi** | **Deskripsi Gerakan**                                        | **Deteksi AI Kamera**                              | **Syarat Naik Level**                 |
| --------- | ------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------- |
| 1         | Robot Kaku    | Menekuk lutut sedikit (setengah jongkok)                     | Sudut lutut ±30°                                   | Tahan 3 detik                         |
| 2         | Robot Lentur  | Menekuk lutut penuh + siku (lengan ditekuk ke dada)          | Sudut lutut & siku ±60°                            | Tahan 5 detik                         |
| 3         | Robot Ganda   | Menekuk lutut + siku + badan membungkuk ke depan             | Kombinasi 3 sudut sendi terdeteksi bersamaan       | Tahan 6 detik, posisi stabil          |
| 4         | Robot Cepat   | Menekuk-lurus berulang (naik-turun) dengan ritme             | Perubahan sudut lutut berulang sesuai tempo        | 5x pengulangan dengan sudut konsisten |
| 5         | Robot Master  | Menekuk penuh (jongkok) + tahan sambil tangan diangkat lurus | Sudut lutut maksimal + posisi lengan lurus terjaga | Tahan 8-10 detik tanpa goyah          |

**2️⃣ MELIUK**

| **Level** | **Nama Misi**  | **Deskripsi Gerakan**                              | **Deteksi AI Kamera**                       | **Syarat Naik Level**                        |
| --------- | -------------- | -------------------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| 1         | Angin Sepoi    | Meliuk pelan ke kanan saja                         | Pergeseran bahu ke 1 arah                   | Meliuk 1x dengan jarak minimal               |
| 2         | Angin Dua Arah | Meliuk ke kanan lalu kiri                          | Pergeseran bahu 2 arah bergantian           | Meliuk 2 arah, masing-masing tertahan sesaat |
| 3         | Pohon Menari   | Meliuk + ayun lengan mengikuti liukan              | Bahu & lengan bergerak selaras              | Liukan + ayunan lengan terdeteksi sinkron    |
| 4         | Badai Ringan   | Meliuk cepat bergantian kanan-kiri berulang        | Frekuensi liukan meningkat, kaki tetap diam | 5x liukan tanpa kaki bergeser                |
| 5         | Pohon Tangguh  | Meliuk penuh (hampir menyentuh sisi tubuh) + tahan | Sudut liuk maksimal + kestabilan pinggang   | Tahan liuk maksimal 3 detik tiap sisi        |

**3️⃣ MEMUTAR**

| **Level** | **Nama Misi**   | **Deskripsi Gerakan**                                  | **Deteksi AI Kamera**                                      | **Syarat Naik Level**                              |
| --------- | --------------- | ------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| 1         | Baling Pelan    | Memutar kepala pelan ke kanan-kiri                     | Rotasi sudut kepala                                        | Rotasi 1 arah, kaki diam                           |
| 2         | Baling Lengan   | Memutar lengan (seperti kincir kecil)                  | Rotasi sudut bahu-lengan                                   | Rotasi lengan penuh 1 putaran                      |
| 3         | Baling Pinggang | Memutar pinggang ke kanan-kiri                         | Rotasi sudut pinggang, kaki tetap                          | Rotasi 2 arah bergantian                           |
| 4         | Baling Ganda    | Memutar lengan + pinggang bersamaan                    | Kombinasi rotasi bahu & pinggang terdeteksi                | Kombinasi gerak selama 5 detik tanpa kaki bergeser |
| 5         | Baling Master   | Memutar badan atas 360° (bertahap) tanpa memindah kaki | Rotasi penuh terdeteksi, posisi kaki tetap sepanjang gerak | Putaran penuh selesai tanpa pergeseran kaki        |

**4️⃣ KESEIMBANGAN**

| **Level** | **Nama Misi**         | **Deskripsi Gerakan**                                  | **Deteksi AI Kamera**                        | **Syarat Naik Level**                        |
| --------- | --------------------- | ------------------------------------------------------ | -------------------------------------------- | -------------------------------------------- |
| 1         | Patung Duduk          | Duduk diam tanpa banyak gerak                          | Minim pergerakan titik tubuh                 | Diam 5 detik                                 |
| 2         | Patung Berdiri        | Berdiri tegak diam, tangan di samping                  | Titik tubuh stabil saat berdiri              | Diam 5 detik tanpa goyah                     |
| 3         | Patung Satu Kaki      | Berdiri dengan satu kaki terangkat sedikit             | Titik pinggul & kaki terjaga stabil          | Tahan 5 detik satu kaki                      |
| 4         | Patung Tangan Terbuka | Satu kaki terangkat + tangan direntangkan              | Stabilitas keseluruhan tubuh (kaki + lengan) | Tahan 8 detik tanpa goyah signifikan         |
| 5         | Patung Master         | Satu kaki terangkat + tangan terentang + mata tertutup | Stabilitas maksimal tanpa bantuan visual     | Tahan 10 detik, minim pergerakan titik tubuh |

**Catatan Implementasi AI Kamera**

- **Progres per siswa** bisa disimpan di dashboard: siapa sudah sampai level berapa di tiap jenis gerakan (total 20 misi kalau 4 gerakan x 5 level)
- **Skor gabungan**: bisa dibuat leaderboard "Total Bintang" dari akumulasi semua gerakan
- **Badge akhir**: siswa yang menyelesaikan level 5 di keempat gerakan dapat badge **"Master Gerak Non-Lokomotor"** 🏆