import React, { useState, useEffect, useCallback } from 'react';
import usuarioService from '../../services/usuarioService';
import authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

const ROLE_OPTIONS = [
  { value: 'ADMINISTRADOR', label: 'Administrador', badge: 'badge-green' },
  { value: 'OPERARIO',       label: 'Operario',       badge: 'badge-blue' },
  { value: 'VETERINARIO',    label: 'Veterinario',    badge: 'badge-purple' },
  { value: 'ZOOTECNISTA',    label: 'Zootecnista',    badge: 'badge-amber' },
];

const roleConfig = (rol) => ROLE_OPTIONS.find(r => r.value === rol) || ROLE_OPTIONS[1];

function Badge({ rol }) {
  const cfg = roleConfig(rol);
  return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
}

const INITIAL_FORM = { nombre: '', email: '', password: '', rol: 'OPERARIO' };

// ── Skeleton loader ──
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-5 animate-pulse">
          <div className="h-4 w-32 rounded bg-dark-500/40" />
          <div className="h-4 w-48 rounded bg-dark-500/40" />
          <div className="h-5 w-24 rounded-full bg-dark-500/40" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-dark-500/40" />
            <div className="h-8 w-8 rounded-lg bg-dark-500/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMINISTRADOR';
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.rol || '').toLowerCase().includes(q)
    );
  });

  // ── Create / Update user ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await usuarioService.update(editingId, form);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuarioService.create(form);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      setForm(INITIAL_FORM);
      setEditingId(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  // ── Open edit modal ──
  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      nombre: user.nombre || '',
      email: user.email || '',
      password: '',
      rol: user.rol || 'OPERARIO',
    });
    setShowModal(true);
  };

  // ── Open create modal ──
  const handleNew = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  // ── Role change ──
  const handleRoleChange = async () => {
    if (!roleTarget || !newRole) return;
    setSaving(true);
    try {
      await usuarioService.update(roleTarget.id, {
        nombre: roleTarget.nombre,
        email: roleTarget.email,
        rol: newRole,
      });
      toast.success(`Rol de ${roleTarget.nombre} cambiado a ${roleConfig(newRole).label}`);
      setShowRoleModal(false);
      setRoleTarget(null);
      setNewRole('');
      await fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cambiar rol');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete user ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await usuarioService.delete(deleteTarget.id);
      toast.success(`Usuario ${deleteTarget.nombre} eliminado`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setSaving(false);
    }
  };

  // ── Modal backdrop ──
  const ModalOverlay = ({ children }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setShowRoleModal(false); setDeleteTarget(null); } }}
    >
      {children}
    </div>
  );

  // ── Access Denied screen ──
  if (!isAdmin) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-up">
        <div className="glass-card !py-20 px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-900/20">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">Acceso Restringido</h2>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
            Esta sección es exclusiva para usuarios con rol <strong className="text-brand-400">Administrador</strong>.
            No tienes permisos para gestionar usuarios del sistema.
          </p>
          <p className="text-sm text-gray-600 mt-6">
            Si necesitas cambiar tu rol, contacta a un administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Administración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de usuarios y roles del sistema</p>
        </div>
        <button onClick={handleNew} className="btn-primary text-xs sm:text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ROLE_OPTIONS.map(r => {
          const count = users.filter(u => u.rol === r.value).length;
          return (
            <div key={r.value} className="stat-card !p-4 text-center">
              <p className="text-2xl font-bold text-gray-100">{count}</p>
              <span className={`badge ${r.badge} mt-1`}>{r.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          placeholder="Buscar por nombre, email o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          aria-label="Buscar usuarios"
        />
      </div>

      {/* ── Table / Cards ── */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          <TableSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card !py-16">
          <svg className="h-12 w-12 empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="empty-state-title">{search ? 'Sin resultados' : 'No hay usuarios registrados'}</p>
          <p className="empty-state-desc">
            {search ? 'Intenta con otro término de búsqueda' : 'Crea el primer usuario para comenzar'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="glass-card overflow-hidden hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="group">
                    <td className="font-medium text-gray-200">{user.nombre || '—'}</td>
                    <td className="text-gray-400">{user.email || '—'}</td>
                    <td>
                      <Badge rol={user.rol} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setRoleTarget(user); setNewRole(user.rol); setShowRoleModal(true); }}
                          className="rounded-lg p-2 text-gray-400 hover:text-brand-400 hover:bg-brand-950/30 transition-colors"
                          title="Cambiar rol"
                          aria-label={`Cambiar rol de ${user.nombre}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-950/30 transition-colors"
                          title="Editar usuario"
                          aria-label={`Editar ${user.nombre}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="rounded-lg p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Eliminar usuario"
                          aria-label={`Eliminar ${user.nombre}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((user) => (
              <div key={user.id} className="glass-card p-4 space-y-3 animate-fade-up">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-200">{user.nombre || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email || '—'}</p>
                  </div>
                  <Badge rol={user.rol} />
                </div>
                <div className="flex gap-2 pt-1 border-t border-dark-400/20">
                  <button
                    onClick={() => { setRoleTarget(user); setNewRole(user.rol); setShowRoleModal(true); }}
                    className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-brand-400 hover:bg-brand-950/30 transition-colors"
                  >
                    Cambiar Rol
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-blue-400 hover:bg-blue-950/30 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <ModalOverlay>
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-scale-in" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar usuario' : 'Nuevo usuario'}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-100">
                {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(INITIAL_FORM); }}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-100 hover:bg-dark-600 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contraseña {editingId && <span className="font-normal normal-case text-gray-600">(dejar vacío para mantener)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  placeholder={editingId ? '••••••••' : 'Contraseña'}
                  required={!editingId}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="input-field"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-400/30">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); setForm(INITIAL_FORM); }}
                  className="btn-secondary px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.nombre.trim() || !form.email.trim()}
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : (editingId ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ── Change Role Modal ── */}
      {showRoleModal && roleTarget && (
        <ModalOverlay>
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-scale-in" role="dialog" aria-modal="true" aria-label="Cambiar rol">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 rounded-full bg-brand-900/30 text-brand-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Cambiar Rol</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {roleTarget.nombre} · <span className="text-gray-500">{roleTarget.email}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Nuevo Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(r => {
                    const isActive = newRole === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setNewRole(r.value)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border transition-all ${
                          isActive
                            ? 'border-brand-500/40 bg-brand-950/40 text-brand-300 shadow-[0_0_0_1px_rgba(5,150,105,0.2)]'
                            : 'border-dark-400/30 bg-dark-700/30 text-gray-400 hover:border-dark-300/50 hover:text-gray-200'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${
                          r.value === 'ADMINISTRADOR' ? 'bg-emerald-400' :
                          r.value === 'OPERARIO' ? 'bg-blue-400' :
                          r.value === 'VETERINARIO' ? 'bg-purple-400' : 'bg-amber-400'
                        }`} />
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-400/30">
                <button
                  onClick={() => { setShowRoleModal(false); setRoleTarget(null); }}
                  className="btn-secondary px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={saving || newRole === roleTarget.rol}
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : 'Cambiar Rol'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <ModalOverlay>
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-scale-in" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2.5 rounded-full bg-red-900/30 text-red-400 shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Eliminar Usuario</h3>
                <p className="text-sm text-gray-400 mt-1">
                  ¿Estás seguro de eliminar a <strong className="text-gray-200">{deleteTarget.nombre}</strong>?
                </p>
                <p className="text-xs text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-400/30">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="btn-primary px-4 py-2.5 text-sm !bg-red-600 hover:!bg-red-500 shadow-lg shadow-red-600/30"
              >
                {saving ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
