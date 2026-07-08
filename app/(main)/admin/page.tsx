'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import CopyButton from '@/components/CopyButton';
import {
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

const AVATARS = ['🤖', '👾', '🦊', '🐱', '🐶', '🦁', '🐸', '🐧', '🦝', '🐯'];

const ACTIVITY_LABELS: Record<string, { emoji: string; color: string }> = {
  login: { emoji: '🔑', color: 'bg-blue-100' },
  complete_quest: { emoji: '✅', color: 'bg-green-100' },
  complete_side_quest: { emoji: '🎯', color: 'bg-purple-100' },
  level_up: { emoji: '⬆️', color: 'bg-amber-100' },
  join_class: { emoji: '🏫', color: 'bg-cyan-100' },
  link_parent: { emoji: '👨‍👩‍👧', color: 'bg-pink-100' },
  create_class: { emoji: '📚', color: 'bg-indigo-100' },
  register: { emoji: '📝', color: 'bg-teal-100' },
};

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">
            {isDevAdmin ? '👑 Dashboard Admin' : '🏫 Admin Sekolah'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isDevAdmin ? 'Kelola seluruh sistem Moveverse' : 'Kelola sekolah kamu'}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'overview' as Tab, label: '📊 Ringkasan', },
          { id: 'users' as Tab, label: '👥 Pengguna', },
          { id: 'logs' as Tab, label: '📋 Log Aktivitas', },
          ...(isDevAdmin ? [{ id: 'schools' as Tab, label: '🏫 Sekolah' }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              tab === t.id
                ? 'gradient-sky text-white shadow-soft'
                : 'bg-white hover:bg-muted text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <OverviewTab isDevAdmin={isDevAdmin} schoolId={userData.schoolId} />
      )}
      {tab === 'users' && (
        <UsersTab isDevAdmin={isDevAdmin} schoolId={userData.schoolId} />
      )}
      {tab === 'logs' && (
        <LogsTab isDevAdmin={isDevAdmin} schoolId={userData.schoolId} />
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

  // Prepare pie chart data
  const rolePieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byRole)
      .filter(([, count]) => count > 0)
      .map(([role, count]) => ({
        name: ROLE_LABELS[role] || role,
        value: count as number,
      }));
  }, [stats]);

  // Activity data (last 7 days)
  const activityData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (today - 6 + i + 7) % 7;
      return {
        name: days[dayIndex],
        aktif: 0, // Will be populated from real data
      };
    });
  }, []);

  if (!stats) {
    return <div className="text-center py-10 text-muted-foreground">Memuat statistik...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDevAdmin && 'totalSchools' in stats && (
          <div className="gradient-magic text-white rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏫</span>
              <div>
                <div className="text-xs font-bold opacity-90">Total Sekolah</div>
                <div className="text-3xl font-extrabold">{stats.totalSchools}</div>
              </div>
            </div>
          </div>
        )}
        <div className="gradient-sky text-white rounded-3xl p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div>
              <div className="text-xs font-bold opacity-90">Total Pengguna</div>
              <div className="text-3xl font-extrabold">{stats.totalUsers}</div>
            </div>
          </div>
        </div>
        <div className="gradient-grass text-white rounded-3xl p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-xs font-bold opacity-90">Aktif Hari Ini</div>
              <div className="text-3xl font-extrabold">{stats.activeToday}</div>
            </div>
          </div>
        </div>
        <div className="gradient-sunset text-white rounded-3xl p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-xs font-bold opacity-90">Aktif Minggu Ini</div>
              <div className="text-3xl font-extrabold">{stats.activeWeek}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role Distribution Pie */}
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Distribusi Role</h3>
          {rolePieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {rolePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orang`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {rolePieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">Belum ada data</div>
          )}
        </div>

        {/* Activity Trend */}
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Aktivitas 7 Hari</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(value) => [`${value} aktif`, '']} />
                <Line
                  type="monotone"
                  dataKey="aktif"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(stats.byRole).map(([role, count]) => (
          <div key={role} className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-md transition-all">
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

      {/* Extra Stats */}
      {'totalClasses' in stats && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <div className="text-sm font-bold text-muted-foreground">Total Kelas</div>
                <div className="text-4xl font-extrabold">{stats.totalClasses}</div>
              </div>
            </div>
          </div>
          {'avgXp' in stats && (
            <div className="bg-white rounded-3xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground">Rata-rata XP</div>
                  <div className="text-4xl font-extrabold text-primary">{stats.avgXp}</div>
                </div>
              </div>
            </div>
          )}
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

  const handleSave = async () => {
    if (editId) {
      await updateUser({
        userId: editId,
        name: form.name,
        role: form.role as "student" | "parent" | "teacher" | "admin" | "school_admin",
        classId: form.classId ? (form.classId as Id<'classes'>) : undefined,
      });
    } else {
      await createUser({
        name: form.name,
        role: form.role as "student" | "parent" | "teacher" | "admin" | "school_admin",
        nis: form.nis || undefined,
        phone: form.phone || undefined,
        classId: form.classId ? (form.classId as Id<'classes'>) : undefined,
        schoolId: form.schoolId ? (form.schoolId as Id<'schools'>) : undefined,
      });
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', role: 'student', nis: '', phone: '', classId: '', schoolId: '' });
  };

  const handleDelete = async (userId: Id<'users'>) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      await deleteUser({ userId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRole(null)}
            className={`px-4 py-2 rounded-full font-bold text-sm ${!filterRole ? 'gradient-sky text-white' : 'bg-white shadow-soft'}`}
          >
            Semua ({users.length})
          </button>
          {Object.entries(ROLE_LABELS).map(([role, label]) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(filterRole === role ? null : role)}
                className={`px-4 py-2 rounded-full font-bold text-sm ${filterRole === role ? 'gradient-sky text-white' : 'bg-white shadow-soft'}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', role: 'student', nis: '', phone: '', classId: '', schoolId: '' }); }}
          className="gradient-grass text-white px-5 py-2 rounded-full font-bold text-sm"
        >
          + Tambah Pengguna
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Cari nama..."
        className="w-full p-3 rounded-2xl border-2 border-border focus:border-primary outline-none bg-white"
      />

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20">
          <h3 className="font-extrabold text-lg mb-4">{editId ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm bg-white"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {form.role === 'student' && (
              <input
                value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                placeholder="NIS"
                className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
              />
            )}
            {form.role === 'teacher' && (
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Telepon"
                className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
              />
            )}
            {classes && classes.length > 0 && (
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm bg-white"
              >
                <option value="">Pilih kelas</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.studentCount} siswa)</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="gradient-sky text-white px-5 py-2 rounded-full font-bold text-sm">
              Simpan
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="bg-muted px-5 py-2 rounded-full font-bold text-sm">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <div key={user._id} className="bg-white rounded-2xl p-4 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                {user.avatar || AVATARS[0]}
              </div>
              <div>
                <div className="font-bold text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
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
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <div className="text-xs font-bold text-primary">{user.xp || 0} XP</div>
                <div className="text-[10px] text-muted-foreground">Lv.{user.level || 1}</div>
              </div>
              <button onClick={() => openEdit(user)} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 font-bold">
                Edit
              </button>
              <button onClick={() => handleDelete(user._id)} className="text-xs px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">Tidak ada pengguna ditemukan</div>
        )}
      </div>
    </div>
  );
}

// ── Logs Tab ──

function LogsTab({ isDevAdmin, schoolId }: { isDevAdmin: boolean; schoolId?: Id<'schools'> }) {
  const globalLogs = useQuery(api.admin.getLogsBySchool, isDevAdmin && !schoolId ? { schoolId: '' as Id<'schools'>, limit: 100 } : 'skip');
  const schoolLogs = useQuery(
    api.admin.getLogsBySchool,
    !isDevAdmin && schoolId ? { schoolId } : 'skip',
  );

  const logs = isDevAdmin ? (globalLogs || []) : (schoolLogs || []);

  if (!logs) {
    return <div className="text-center py-10 text-muted-foreground">Memuat log...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold text-lg mb-4">📋 Log Aktivitas Terbaru</h3>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📭</div>
              <p>Belum ada aktivitas</p>
            </div>
          ) : (
            logs.slice(0, 50).map((log, i) => {
              const activityInfo = ACTIVITY_LABELS[log.action] || { emoji: '📌', color: 'bg-gray-100' };
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${activityInfo.color} flex items-center justify-center text-lg shrink-0`}>
                    {activityInfo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{log.userId || 'User'}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{log.action}</span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Schools Tab ──

function SchoolsTab() {
  const schools = useQuery(api.schools.getAllSchools);
  const createSchool = useMutation(api.admin.createSchool);
  const createSchoolAdmin = useMutation(api.admin.createSchoolAdmin);
  const [showForm, setShowForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', address: '', npsn: '' });
  const [adminForm, setAdminForm] = useState({ name: '', phone: '' });

  if (!schools) {
    return <div className="text-center py-10 text-muted-foreground">Memuat sekolah...</div>;
  }

  const handleCreate = async () => {
    if (!form.name || !form.slug) return;
    await createSchool({
      name: form.name,
      address: form.address || undefined,
      npsn: form.npsn || undefined,
    });
    setForm({ name: '', slug: '', address: '', npsn: '' });
    setShowForm(false);
  };

  const handleCreateSchoolAdmin = async (schoolId: Id<'schools'>) => {
    if (!adminForm.name) return;
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
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-xl">🏫 Manajemen Sekolah</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gradient-grass text-white px-5 py-2 rounded-full font-bold text-sm"
        >
          + Tambah Sekolah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20">
          <h3 className="font-extrabold text-lg mb-4">Tambah Sekolah Baru</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama Sekolah"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="slug (otomatis dari nama)"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
            />
            <input
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value })}
              placeholder="NPSN (opsional)"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
            />
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat (opsional)"
              className="px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="gradient-sky text-white px-5 py-2 rounded-full font-bold text-sm">
              Simpan
            </button>
            <button onClick={() => setShowForm(false)} className="bg-muted px-5 py-2 rounded-full font-bold text-sm">
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
