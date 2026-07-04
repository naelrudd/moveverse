# PRD: MoveVerse — Update Fitur

**Produk:** MoveVerse (moveverse.my.id)
**Repo:** naelrudd/moveverse
**Stack:** Next.js 15 + Convex + Clerk + Vercel
**Tanggal:** 2 Juli 2026
**Author:** Natan

---

## 1. Latar Belakang

Update ini mencakup revisi pada: sistem profil siswa, pemisahan AI Mova per role, scope dashboard perkembangan, sistem poin & level, quest, performa game, navigasi Worlds, nav Orang Tua, dan fitur Kelas — disesuaikan dengan struktur route yang sudah ada di `app/(main)/`.

---

## 2. Ruang Lingkup Perubahan

### 2.1 Foto Profil Siswa → Ikon Avatar
- **File terkait:** `onboarding/page.tsx` (step setup profil), skema `students` di Convex.
- Foto profil siswa diganti jadi **pilihan ikon avatar** (bukan upload foto asli).
- Siswa memilih 1 ikon avatar dari daftar preset saat onboarding.
- **Open question:** jumlah & style ikon avatar (kartun/hewan/karakter game?), disimpan sebagai enum/string id di Convex, bukan file upload.

### 2.2 AI Mova — Dipecah Jadi Dua Konteks
- **File terkait:** `assessment/page.tsx` (saat ini 1 halaman dipakai oleh nav student & teacher sebagai "AI Coach").
- Dipecah jadi 2 varian berdasarkan role, tetap di route yang sama tapi logic/context dibedakan lewat role check (Clerk role):

| Varian | Role | Fokus |
|---|---|---|
| AI Mova (Siswa) | student | Aktivitas & interaksi **di rumah** |
| AI Mova (Guru) | teacher | Aktivitas & interaksi **di sekolah** |

- Konteks percakapan, prompt, dan data yang di-fetch berbeda antar role — tidak ada cross-context.
- **Open question:** tetap 1 route `assessment/page.tsx` dengan conditional rendering, atau dipecah jadi 2 route terpisah (`assessment/student`, `assessment/teacher`)?

### 2.3 Dashboard Perkembangan — Fokus Non-Locomotor
- **File terkait:** `dashboard/stats/page.tsx` (Statistik), kemungkinan juga `dashboard/student/page.tsx`.
- Dashboard perkembangan **hanya menampilkan data non-locomotor**.
- Kategori gerakan lain (locomotor, manipulative) **tidak ditampilkan** di dashboard ini.
- **Open question:** data locomotor/manipulative tetap disimpan di Convex (untuk laporan lain / masa depan) meski tidak tampil di UI?

### 2.4 Sistem Poin & Level
- Poin per level **tidak seragam** — mengikuti tingkat kesulitan (makin sulit → makin besar poinnya).
- Level **wajib diselesaikan berurutan** (sequential unlock, disimpan sebagai progress state per siswa di Convex).
- Struktur level:
  - 1 gerakan = **5 level**
  - Total 3 gerakan × 5 level = **15 level**
- Kemungkinan terkait ke `worlds/page.tsx` (tempat game interaktif per gerakan dimainkan).

### 2.5 Quest Aktif
- Quest aktif = **gabungan beberapa gerakan non-locomotor** dalam satu rangkaian/sesi.
- Poin quest aktif **lebih besar** dibanding poin per-level individual (reward combo).
- **Open question:** formula/multiplier poin quest vs poin level biasa?

### 2.6 Performa Game
- Section "Performa Game" (kemungkinan di `dashboard/student/page.tsx`) diisi **otomatis dari hasil game interaktif** di `worlds/page.tsx`, bukan data manual/statis.

### 2.7 Navigasi "Worlds" (Siswa)
- **File terkait:** `components/Header.tsx` → `navByRole.student`.
- Urutan nav student saat ini: `Dashboard, Statistik, Worlds, AI Coach`.
- **Worlds dipindah ke posisi lebih depan** (misal: `Dashboard, Worlds, Statistik, AI Coach`).
- Di dalam `dashboard/student/page.tsx`, tambahkan **3 entry/shortcut ke Worlds**.
- **Open question:** apakah 3 entry World di dashboard punya konten berbeda (misal: 3 gerakan berbeda) atau shortcut yang sama ke halaman Worlds?

### 2.8 Nav Orang Tua — Hapus & Rename
- **File terkait:** `components/Header.tsx` → `navByRole.parent`.
- Nav parent saat ini: `Anakku, Aktivitas, Leaderboard, Worlds`.
- Perubahan:
  - Item nav **"Aktivitas" dihapus**.
  - Item nav **"Anakku" di-rename jadi "Aktivitas"** — **hanya label**, route (`parent/child/page.tsx`) & isi/konten tetap sama.
  - Item nav **"Worlds" dihapus**.
- Nav parent hasil akhir: `Aktivitas (ex-Anakku), Leaderboard`.

### 2.9 Fitur Kelas
- **File terkait:** `teacher/page.tsx` (class management).
- Fitur Kelas **hanya untuk Kelas 1 dan Kelas 2** (kelas lain di-hide/disabled untuk saat ini, meski 36 kelas sudah ter-seed di Convex prod).

---

## 3. Out of Scope
- Admin/school dashboard (`school/page.tsx`) — tidak ada perubahan di scope ini.
- Leaderboard logic (`parent/leaderboard`, `teacher/leaderboard`) — tidak disebutkan ada perubahan.

## 4. Open Questions
1. Jumlah & desain ikon avatar profil siswa?
2. Apakah data locomotor/manipulative tetap tersimpan di backend walau tidak tampil di dashboard?
3. Formula/multiplier poin quest aktif vs poin level biasa?
4. Apakah 3 entry World di dashboard siswa beda konten atau shortcut yang sama?
5. AI Mova siswa/guru: 1 route dengan conditional logic, atau 2 route terpisah?

## 5. Referensi File (dari SKILL.md)
```
app/(main)/
  dashboard/student/page.tsx    # 2.3, 2.6, 2.7
  dashboard/stats/page.tsx      # 2.3
  parent/page.tsx                
  parent/child/page.tsx         # 2.8 (rename target)
  parent/leaderboard/page.tsx    
  teacher/page.tsx              # 2.9
  worlds/page.tsx               # 2.4, 2.6, 2.7
  onboarding/page.tsx           # 2.1
  assessment/page.tsx           # 2.2

components/
  Header.tsx                    # 2.7, 2.8 (navByRole)
```
