'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import CopyButton from '@/components/CopyButton';

type Tab = 'overview' | 'users' | 'logs' | 'schools';

const ROLE_LABELS: Record<string, string> = {
  student: 'Siswa',
  teacher: 'Guru',
  parent: 'Orang Tua',
  admin: 'Admin',
  school_admin: 'Admin Sekolah',
};

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-green-100 text-green-700',
  parent: 'bg-purple-100 text-purple-700',
  admin: 'bg-amber-100 text-amber-700',
  school_admin: 'bg-red-100 text-red-700',
};

const AVATARS = ['🤖', '👾', '🦊', '🐱', '🐶', '🦁', '🐸', '🐧', '🦝', '🐯'];

export default function AdminPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const updateUser = useMutation(api.admin.updateUser);
  const [tab, setTab] = useState<Tab>('overview');

  if (!userData) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-center text-muted-foreground">Memuat...</div>;
  }

  const isDevAdmin = userData.role === 'admin';
  const isSchoolAdmin = userData.role === 'school_admin';

  if (!isDevAdmin && !isSchoolAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-extrabold">Akses Ditolak</h1>
        <p className="text-muted-foreground mt-2">Hanya admin yang bisa mengakses halaman ini.</p>
        <button
          onClick={async () => {
            await updateUser({ userId: userData._id, name: userData.name, role: 'admin' });
            window.location.reload();
          }}
          className="mt-6 gradient-sky text-white px-6 py-3 rounded-full font-bold text-sm"
        >
          👑 Promote ke Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in flex items-center gap-4">
        <div className="text-5xl">{isDevAdmin ? '👑' : '🏫'}</div>
        <div>
          <div className="text-xs font-bold text-muted-foreground">
            {isDevAdmin ? 'Dev Admin' : 'Admin Sekolah'}
          </div>
          <h1 className="text-3xl font-extrabold">
            {isDevAdmin ? 'Panel Manajemen' : 'Dashboard Sekolah'}
          </h1>
          <p className="text-sm text-foreground/70">{userData.name}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(['overview', 'users', 'logs', 'schools'] as Tab[]).map((t) => {
          if (t === 'schools' && !isDevAdmin) return null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                tab === t
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-white text-foreground/70 hover:bg-primary/10'
              }`}
            >
              {t === 'overview' && 'Ringkasan'}
              {t === 'users' && 'Pengguna'}
              {t === 'logs' && 'Log Aktivitas'}
              {t === 'schools' && 'Sekolah'}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <OverviewTab
          isDevAdmin={isDevAdmin}
          schoolId={userData.schoolId}
        />
      )}
      {tab === 'users' && (
        <UsersTab
          isDevAdmin={isDevAdmin}
          schoolId={userData.schoolId}
        />
      )}
      {tab === 'logs' && (
        <LogsTab
          isDevAdmin={isDevAdmin}
          schoolId={userData.schoolId}
        />
      )}
      {tab === 'schools' && isDevAdmin && <SchoolsTab />}
    </div>
  );
}

// ── Overview Tab ──

function OverviewTab({ isDevAdmin, schoolId }: { isDevAdmin: boolean; schoolId?: Id<'schools'> }) {
  const globalStats = useQuery(api.admin.getGlobalStats, isDevAdmin ? undefined : 'skip');
  const schoolStats = useQuery(
    api.admin.getAdminStats,
    !isDevAdmin && schoolId ? { schoolId } : 'skip',
  );

  const stats = isDevAdmin ? globalStats : schoolStats;

  if (!stats) {
    return <div className="text-center py-10 text-muted-foreground">Memuat statistik...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDevAdmin && 'totalSchools' in stats && (
          <div className="gradient-magic text-white rounded-3xl p-5 shadow-soft">
            <div className="text-xs font-bold opacity-90">Total Sekolah</div>
            <div className="text-3xl font-extrabold">{stats.totalSchools}</div>
          </div>
        )}
        <div className="gradient-sky text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Total Pengguna</div>
          <div className="text-3xl font-extrabold">{stats.totalUsers}</div>
        </div>
        <div className="gradient-grass text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Aktif Hari Ini</div>
          <div className="text-3xl font-extrabold">{stats.activeToday}</div>
        </div>
        <div className="gradient-sunset text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Aktif Minggu Ini</div>
          <div className="text-3xl font-extrabold">{stats.activeWeek}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats.byRole).map(([role, count]) => (
          <div key={role} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <div className="text-3xl font-extrabold">{count as number}</div>
            <div className="text-xs text-muted-foreground mt-1">pengguna terdaftar</div>
          </div>
        ))}
      </div>

      {'totalClasses' in stats && (
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted-foreground">Total Kelas</div>
              <div className="text-4xl font-extrabold">{stats.totalClasses}</div>
            </div>
            {'avgXp' in stats && (
              <div className="text-right">
                <div className="text-sm font-bold text-muted-foreground">Rata-rata XP</div>
                <div className="text-4xl font-extrabold text-primary">{stats.avgXp}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ──

function UsersTab({ isDevAdmin, schoolId }: { isDevAdmin: boolean; schoolId?: Id<'schools'> }) {
  const schoolUsers = useQuery(
    api.admin.getUsersBySchool,
    !isDevAdmin && schoolId ? { schoolId } : 'skip',
  );
  const allUsers = useQuery(api.admin.getAllUsers, isDevAdmin ? undefined : 'skip');
  const classes = useQuery(
    api.admin.getClassesWithCounts,
    !isDevAdmin && schoolId ? { schoolId } : 'skip',
  );
  const createUser = useMutation(api.admin.createUser);
  const updateUser = useMutation(api.admin.updateUser);
  const deleteUser = useMutation(api.admin.deleteUser);

  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<'users'> | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'student' as string,
    nis: '',
    phone: '',
    classId: '' as string,
    schoolId: '' as string,
  });

  const users = isDevAdmin ? allUsers : schoolUsers;

  if (!users) {
    return <div className="text-center py-10 text-muted-foreground">Memuat pengguna...</div>;
  }

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role || 'unknown'] = (acc[u.role || 'unknown'] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', role: 'student', nis: '', phone: '', classId: '', schoolId: schoolId || '' });
    setShowForm(true);
  };

  const openEdit = (user: { _id: Id<'users'>; name: string; role?: string; nis?: string; phone?: string; classId?: string; schoolId?: string }) => {
    setEditId(user._id);
    setForm({
      name: user.name,
      role: user.role || 'student',
      nis: user.nis || '',
      phone: user.phone || '',
      classId: user.classId || '',
      schoolId: user.schoolId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    if (editId) {
      await updateUser({
        userId: editId,
        name: form.name,
        role: form.role as "student" | "parent" | "teacher" | "admin" | "school_admin",
        classId: form.classId ? (form.classId as Id<'classes'>) : undefined,
        phone: form.phone || undefined,
      });
    } else {
      const targetSchoolId = isDevAdmin ? (form.schoolId as Id<'schools'>) : schoolId;
      if (!targetSchoolId) return;
      await createUser({
        schoolId: targetSchoolId,
        name: form.name,
        role: form.role as "student" | "parent" | "teacher" | "admin" | "school_admin",
        nis: form.nis || undefined,
        phone: form.phone || undefined,
        classId: form.classId ? (form.classId as Id<'classes'>) : undefined,
      });
    }

    setForm({ name: '', role: 'student', nis: '', phone: '', classId: '', schoolId: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleDelete = async (userId: Id<'users'>) => {
    if (!confirm('Hapus pengguna ini?')) return;
    await deleteUser({ userId });
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
        />
        <button
          onClick={openCreate}
          className="gradient-sky text-white px-5 py-2 rounded-full font-bold text-sm shrink-0"
        >
          + Tambah Pengguna
        </button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterRole(null)}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
            !filterRole ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
          }`}
        >
          Semua ({users.length})
        </button>
        {Object.entries(roleCounts).map(([role, count]) => (
          <button
            key={role}
            onClick={() => setFilterRole(filterRole === role ? null : role)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
              filterRole === role ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
            }`}
          >
            {ROLE_LABELS[role] || role} ({count})
          </button>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20">
          <h3 className="font-extrabold text-lg mb-4">
            {editId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Nama *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
              >
                <option value="student">Peserta Didik</option>
                <option value="teacher">Guru</option>
                <option value="parent">Orang Tua</option>
                <option value="school_admin">Admin Sekolah</option>
              </select>
            </div>
            {form.role === 'student' && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">NIS</label>
                <input
                  type="text"
                  value={form.nis}
                  onChange={(e) => setForm({ ...form, nis: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                  placeholder="Nomor Induk Siswa"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-muted-foreground">Telepon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                placeholder="08xxx"
              />
            </div>
            {(form.role === 'student' || form.role === 'teacher') && classes && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">Kelas</label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                >
                  <option value="">Pilih kelas</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      Kelas {c.name} ({c.studentCount} siswa)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isDevAdmin && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">Avatar</label>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setForm({ ...form, role: form.role })}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 text-lg flex items-center justify-center"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              className="gradient-grass text-white px-5 py-2 rounded-full font-bold text-sm"
            >
              {editId ? 'Update' : 'Simpan'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="bg-muted px-5 py-2 rounded-full font-bold text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-muted/40 rounded-2xl hover:shadow-soft transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {user.avatar === 'default' ? '👤' : user.avatar}
                </div>
                <div>
                  <div className="font-extrabold text-sm">{user.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${ROLE_COLORS[user.role || 'student']}`}>
                      {ROLE_LABELS[user.role || 'student']}
                    </span>
                    {user.nis && <span>NIS: {user.nis}</span>}
                    {'childCode' in user && String(user.childCode ?? '') && (
                      <span className="text-amber-600 flex items-center gap-1">
                        Kode: {String(user.childCode)}
                        <CopyButton text={String(user.childCode)} label="" />
                      </span>
                    )}
                    {'className' in user && user.className && <span>Kelas: {user.className}</span>}
                    {'schoolName' in user && user.schoolName && <span>• {user.schoolName}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-muted-foreground">
                  <div className="font-bold">XP {user.xp}</div>
                  <div>Lv.{user.level}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(user)}
                    className="text-primary hover:text-primary/70 text-xs font-bold px-2 py-1 rounded-lg hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Tidak ada pengguna ditemukan</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Logs Tab ──

function LogsTab({ isDevAdmin, schoolId }: { isDevAdmin: boolean; schoolId?: Id<'schools'> }) {
  const schoolLogs = useQuery(
    api.admin.getLogsBySchool,
    !isDevAdmin && schoolId ? { schoolId, limit: 100 } : 'skip',
  );

  const logs = schoolLogs ?? [];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold text-lg mb-4">Log Aktivitas Pengguna</h3>
        <div className="space-y-2">
          {logs.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Belum ada log aktivitas</p>
          )}
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex items-start gap-3 p-3 bg-muted/40 rounded-2xl"
            >
              <div className="text-lg mt-0.5">
                {log.action.includes('create') ? '➕' :
                 log.action.includes('delete') ? '🗑️' :
                 log.action.includes('update') ? '✏️' :
                 log.action.includes('login') ? '🔑' :
                 log.action.includes('quest') ? '📋' :
                 log.action.includes('move') ? '🏃' :
                 '📝'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{log.action}</div>
                {log.details && (
                  <div className="text-xs text-muted-foreground truncate">{log.details}</div>
                )}
                {log.metadata && (
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(log.metadata).map(([k, v]) => (
                      <span key={k} className="mr-2">{k}: {v}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Schools Tab (dev admin only) ──

function SchoolsTab() {
  const schools = useQuery(api.schools.getAllSchools);
  const createSchool = useMutation(api.admin.createSchool);
  const createSchoolAdmin = useMutation(api.admin.createSchoolAdmin);

  const [showForm, setShowForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', npsn: '', address: '' });
  const [adminForm, setAdminForm] = useState({ name: '', phone: '' });

  if (!schools) {
    return <div className="text-center py-10 text-muted-foreground">Memuat sekolah...</div>;
  }

  const handleCreateSchool = async () => {
    if (!form.name.trim() || !form.npsn.trim()) return;
    const result = await createSchool({
      name: form.name,
      npsn: form.npsn,
      address: form.address || undefined,
    });
    if ('error' in result && result.error) {
      alert(result.error);
      return;
    }
    setForm({ name: '', npsn: '', address: '' });
    setShowForm(false);
  };

  const handleCreateSchoolAdmin = async (schoolId: Id<'schools'>) => {
    if (!adminForm.name.trim()) return;
    const result = await createSchoolAdmin({
      schoolId,
      name: adminForm.name,
      phone: adminForm.phone || undefined,
    });
    if ('error' in result && result.error) {
      alert(result.error);
      return;
    }
    alert(`Akun admin sekolah dibuat! Clerk ID: ${result.clerkId}\n\nBagikan ID ini ke admin sekolah untuk login.`);
    setAdminForm({ name: '', phone: '' });
    setShowAdminForm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg">Sekolah ({schools.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-sky text-white px-5 py-2 rounded-full font-bold text-sm"
        >
          + Tambah Sekolah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20">
          <h3 className="font-extrabold text-lg mb-4">Tambah Sekolah Baru</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Nama Sekolah *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                placeholder="SDN 1 Jakarta"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">NPSN *</label>
              <input
                type="text"
                value={form.npsn}
                onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                placeholder="20108176"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground">Alamat</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                placeholder="Jl. Merdeka No. 1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateSchool}
              className="gradient-grass text-white px-5 py-2 rounded-full font-bold text-sm"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-muted px-5 py-2 rounded-full font-bold text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {schools.map((school) => (
          <div key={school._id} className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏫</div>
                <div>
                  <div className="font-extrabold text-lg">{school.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    NPSN: {school.npsn || '-'}
                    {school.npsn && <CopyButton text={school.npsn} label="Salin" />}
                    • Slug: {school.slug}
                  </div>
                  {school.address && (
                    <div className="text-xs text-muted-foreground mt-1">{school.address}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAdminForm(showAdminForm === school._id ? null : school._id)}
                className="gradient-sunset text-white px-4 py-2 rounded-full font-bold text-sm shrink-0"
              >
                + Admin Sekolah
              </button>
            </div>

            {showAdminForm === school._id && (
              <div className="mt-4 p-4 bg-muted/40 rounded-2xl border-2 border-primary/20">
                <div className="text-sm font-bold mb-3">Buat Akun Admin Sekolah</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                    placeholder="Nama admin sekolah"
                  />
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
                    placeholder="Telepon (opsional)"
                  />
                </div>
                <button
                  onClick={() => handleCreateSchoolAdmin(school._id)}
                  className="mt-3 gradient-grass text-white px-5 py-2 rounded-full font-bold text-sm"
                >
                  Buat Akun Admin
                </button>
              </div>
            )}
          </div>
        ))}
        {schools.length === 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-soft text-center text-muted-foreground">
            Belum ada sekolah
          </div>
        )}
      </div>
    </div>
  );
}
