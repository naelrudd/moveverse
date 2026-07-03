#!/usr/bin/env python3
"""
Moveverse CLI — Sistem Progres Game Gerak Motorik Anak
5 Level | 3 Status: Lulus Penuh / Lulus Bersyarat (Dampingan Guru) / Belum Lulus
"""

import json, sys, os
from pathlib import Path

DB_PATH = Path(__file__).parent / ".moveverse_players.json"

# ══════════════════════════════════════════════
#  LEVEL TABLE
# ══════════════════════════════════════════════
LEVEL_TABLE = [
    # (level, full_pass_min, conditional_min, conditional_max)
    (1, 0,   0,   0),    # Level 1: starting
    (2, 50,  40,  49),
    (3, 100, 85,  99),
    (4, 160, 140, 159),
    (5, 250, 220, 249),
]


def load_db() -> dict:
    if DB_PATH.exists():
        return json.loads(DB_PATH.read_text(encoding="utf-8"))
    return {}


def save_db(db: dict):
    DB_PATH.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")


def get_player(db: dict, name: str) -> dict:
    if name not in db:
        db[name] = {"points": 0, "level": 1, "needs_tutor": False, "missions": []}
    return db[name]


def evaluate_level(points: int, current_level: int):
    """Returns (new_level, status_str, needs_tutor_flag)"""
    # Check from highest possible level downward
    for lvl in range(5, current_level, -1):
        _, full_min, cond_min, cond_max = LEVEL_TABLE[lvl - 1]
        if points >= full_min:
            return lvl, f"Lulus Penuh", False
        if cond_min <= points <= cond_max:
            return lvl, f"Lulus Bersyarat [STATUS: BUTUH DAMPINGAN GURU]", True

    # Check if still qualifies for current level's conditional
    if current_level > 1:
        _, full_min, cond_min, cond_max = LEVEL_TABLE[current_level - 1]
        if points >= full_min:
            return current_level, "Lulus Penuh", False

    # Stay at current level
    # Calculate what's needed
    next_lvl = current_level + 1
    if next_lvl <= 5:
        _, next_full, next_cond_min, _ = LEVEL_TABLE[next_lvl - 1]
        gap_full = max(0, next_full - points)
        gap_cond = max(0, next_cond_min - points)
        if gap_cond > 0:
            return current_level, f"Belum Lulus (butuh {gap_full} poin lagi atau {gap_cond} poin untuk jalur dampingan)", False
        else:
            return current_level, "Lulus Bersyarat [STATUS: BUTUH DAMPINGAN GURU]", True

    return current_level, "Level Maksimal Tercapai", False


def cmd_add_mission(name: str, mission_pts: int):
    db = load_db()
    p = get_player(db, name)
    p["points"] += mission_pts
    p["missions"].append({"points": mission_pts, "total_after": p["points"]})
    save_db(db)

    print(f"┌─────────────────────────────────────────────┐")
    print(f"│  🎯 Misi Selesai: {name}")
    print(f"│  +{mission_pts} poin  →  Total: {p['points']} poin")
    print(f"└─────────────────────────────────────────────┘")


def cmd_check_level(name: str):
    db = load_db()
    if name not in db:
        print(f"  ❌ Murid '{name}' tidak ditemukan. Jalankan: add_mission {name} <poin>")
        return

    p = db[name]
    pts = p["points"]
    cur_lvl = p["level"]

    new_lvl, status, needs_tutor = evaluate_level(pts, cur_lvl)

    # Update player
    p["level"] = new_lvl
    p["needs_tutor"] = needs_tutor
    save_db(db)

    # Build output
    lvl_arrow = f"Lv {cur_lvl} → Lv {new_lvl}" if new_lvl > cur_lvl else f"Lv {new_lvl}"
    tutor_warn = ""
    if needs_tutor:
        # Calculate deficit to full pass
        _, full_min, _, _ = LEVEL_TABLE[new_lvl - 1]
        deficit = full_min - pts
        tutor_warn = f"\n  ⚠️  [STATUS: BUTUH DAMPINGAN GURU] (Kekurangan {deficit} poin dari target {full_min})"

    icon = "✅" if "Penuh" in status else ("🟡" if "Bersyarat" in status else "🔴")

    print(f"┌─────────────────────────────────────────────┐")
    print(f"│  📊 Status Moveverse")
    print(f"│  Nama   : {name}")
    print(f"│  Poin   : {pts}")
    print(f"│  Level  : {lvl_arrow}")
    print(f"│  {icon} {status}{tutor_warn}")
    print(f"└─────────────────────────────────────────────┘")


def cmd_status_report():
    db = load_db()
    flagged = [(n, p) for n, p in db.items() if p.get("needs_tutor")]

    print(f"┌─────────────────────────────────────────────┐")
    print(f"│  📋 LAPORAN DAMPINGAN GURU")
    print(f"│  Murid yang membutuhkan perhatian ekstra")
    print(f"├─────────────────────────────────────────────┤")

    if not flagged:
        print(f"│  ✅ Tidak ada murid dengan flag dampingan.")
    else:
        for name, p in flagged:
            _, full_min, _, _ = LEVEL_TABLE[p["level"] - 1]
            deficit = full_min - p["points"]
            print(f"│  👤 {name}")
            print(f"│     Level {p['level']} | {p['points']} poin | Kurang {deficit} poin dari Lulus Penuh")
            print(f"│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─")

    print(f"└─────────────────────────────────────────────┘")


def cmd_list():
    db = load_db()
    if not db:
        print("  Belum ada data murid.")
        return

    print(f"┌─────────────────────────────────────────────────────────┐")
    print(f"│  🏆 DAFTAR SEMUA MURID MOVEVERSE")
    print(f"├──────┬──────────────────────┬────────┬──────────────────┤")
    print(f"│ Lv   │ Nama                 │ Poin   │ Status           │")
    print(f"├──────┼──────────────────────┼────────┼──────────────────┤")

    for name, p in sorted(db.items(), key=lambda x: (-x[1]["level"], -x[1]["points"])):
        lvl = p["level"]
        pts = p["points"]
        flag = "🟡 Dampingan" if p.get("needs_tutor") else "✅ Aktif"
        if lvl == 5:
            _, full_min, _, _ = LEVEL_TABLE[lvl - 1]
            if pts >= full_min:
                flag = "🏆 Lulus!"
        print(f"│  {lvl:<3} │ {name:<20} │ {pts:<6} │ {flag:<16} │")

    print(f"└──────┴──────────────────────┴────────┴──────────────────┘")


def cmd_reset(name: str):
    db = load_db()
    if name in db:
        del db[name]
        save_db(db)
        print(f"  🗑️  Data '{name}' dihapus.")
    else:
        print(f"  ❌ '{name}' tidak ditemukan.")


def cmd_help():
    print("""
╔═══════════════════════════════════════════════════╗
║  🎮 MOVEVERSE CLI — Sistem Progres Game          ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  Perintah:                                        ║
║                                                   ║
║  add_mission <nama> <poin>                        ║
║    Tambah poin misi ke murid                      ║
║                                                   ║
║  check_level <nama>                               ║
║    Cek level & status kelulusan murid             ║
║                                                   ║
║  status_report                                    ║
║    Daftar semua murid butuh dampingan guru        ║
║                                                   ║
║  list                                             ║
║    Tampilkan semua murid                          ║
║                                                   ║
║  reset <nama>                                     ║
║    Hapus data murid                               ║
║                                                   ║
║  help                                             ║
║    Tampilkan bantuan ini                          ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║  LEVEL TABLE:                                     ║
║  Lv 1→2: 50 penuh | 40-49 bersyarat              ║
║  Lv 2→3: 100 penuh | 85-99 bersyarat             ║
║  Lv 3→4: 160 penuh | 140-159 bersyarat           ║
║  Lv 4→5: 250 penuh | 220-249 bersyarat           ║
╚═══════════════════════════════════════════════════╝
""")


def main():
    if len(sys.argv) < 2:
        cmd_help()
        return

    cmd = sys.argv[1].lower()

    if cmd == "add_mission" and len(sys.argv) >= 4:
        name = sys.argv[2]
        pts = int(sys.argv[3])
        cmd_add_mission(name, pts)

    elif cmd == "check_level" and len(sys.argv) >= 3:
        cmd_check_level(sys.argv[2])

    elif cmd == "status_report":
        cmd_status_report()

    elif cmd == "list":
        cmd_list()

    elif cmd == "reset" and len(sys.argv) >= 3:
        cmd_reset(sys.argv[2])

    elif cmd == "help":
        cmd_help()

    else:
        print("  ❌ Perintah tidak dikenal. Ketik 'help' untuk bantuan.")
        cmd_help()


if __name__ == "__main__":
    main()
