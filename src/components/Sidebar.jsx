import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import usuarioService from '../services/usuarioService';
import { ConfirmModal } from '../components/Modal';

const ICONS = {
 home: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
 cow: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25-4.5-8.25 4.5m16.5 0l-8.25 4.5m8.25-4.5v10.5l-8.25 4.5m0-10.5L3.75 7.5m8.25 4.5v10.5" /></svg>,
 clipboard: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
 truck: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9H12.375a1.125 1.125 0 01-.75.278H11.25a1.125 1.125 0 01-.75-.278H8.625a1.125 1.125 0 01-.75.278h-.984m0 0H6.75m0 0H4.5a1.125 1.125 0 01-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125h1.5" /></svg>,
 operations: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
 medkit: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
 heart: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
 infrastructure: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
 chart: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
 admin: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
 settings: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
 logout: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
 delete: <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
};

const menuGroups = [
 {
 label: 'Menú Principal',
 items: [
 { name: 'Panel', to: '.', end: true, icon: 'home' },
 { name: 'Ganado', to: 'ganado', icon: 'cow' },
 { name: 'Movimientos', to: 'movimientos', icon: 'truck' },
 { name: 'Operaciones', to: 'operaciones', icon: 'operations' },
 ],
 },
 {
 label: 'Gestión',
 items: [
 { name: 'Sanidad', to: 'sanidad', icon: 'medkit' },
 { name: 'Reproducción', to: 'reproduccion', icon: 'heart' },
 { name: 'Infraestructura', to: 'infraestructura', icon: 'infrastructure' },
 ],
 },
 {
 label: 'Datos',
 items: [
 { name: 'Producción', to: 'produccion', icon: 'chart' },
 
 { name: 'Administración', to: 'administracion', icon: 'admin' },
 ],
 },
];

const Sidebar = ({ isOpen, onClose }) => {
 const navigate = useNavigate();
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const handleDeleteAccount = async () => {
 setDeleting(true);
 try {
 await usuarioService.deleteOwnAccount();
 authService.logout();
 navigate('/login');
 } catch (err) {
 alert(err?.response?.data?.message || 'No se pudo eliminar la cuenta');
 setDeleting(false);
 }
 setShowDeleteModal(false);
 };

 const handleLogout = () => {
 authService.logout();
 navigate('/login');
 };

 const navContent = (
 <>
 {/* Logo */}
 <div className="flex h-16 shrink-0 items-center border-b border-dark-400/30 px-5">        <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-dark-400/50 shadow-lg shadow-black/20">
 <img src="/logo.png" alt="GreenField" className="h-7 w-7 object-contain" />
 </div>
 <div>
 <span className="text-base font-bold tracking-tight text-white">GreenField</span>
 <span className="block text-[10px] font-medium text-brand-400 tracking-wider uppercase">Gestión Ganadera</span>
 </div>
 </div>
 </div>

 {/* Navigation */}
 <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
 {menuGroups.map((group, gi) => (
 <div key={gi} className="mb-5">
 <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500/80">{group.label}</p>
 <nav className="space-y-0.5" aria-label={group.label}>
 {group.items.map(item => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 onClick={onClose}
 className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
 aria-current={({ isActive }) => isActive ? 'page' : undefined}
 >
 {ICONS[item.icon]}
 <span className="truncate">{item.name}</span>
 </NavLink>
 ))}
 </nav>
 </div>
 ))}
 </div>      {/* Bottom Actions */}
      <div className="shrink-0 border-t border-dark-400/30 bg-dark-800/50 p-3 space-y-0.5">
        <button
 onClick={handleLogout}
 className="nav-item w-full text-red-400/80 hover:bg-red-950/20 hover:text-red-300"
 aria-label="Cerrar Sesión"
 >
 {ICONS.logout}
 <span className="truncate">Cerrar Sesión</span>
 </button>
 <button
 onClick={() => setShowDeleteModal(true)}
 className="nav-item w-full text-gray-500 hover:bg-red-950/20 hover:text-red-400"
 aria-label="Eliminar Cuenta"
 >
 {ICONS.delete}
 <span className="truncate">Eliminar Cuenta</span>
 </button>
 <ConfirmModal
 isOpen={showDeleteModal}
 onClose={() => { setShowDeleteModal(false); setDeleting(false); }}
 onConfirm={handleDeleteAccount}
 title="Eliminar cuenta permanentemente"
 message="Se borrarán todos tus datos sin posibilidad de recuperarlos. ¿Estás seguro?"
 confirmText={deleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
 cancelText="Cancelar"
 variant="danger"
 />
 </div>
 </>
 );

 return (
 <>
 {/* Desktop sidebar */}
 <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-dark-400/30 bg-dark-900 lg:flex shadow-2xl shadow-black/20" aria-label="Sidebar principal">
 {navContent}
 </aside>

 {/* Mobile overlay */}
 {isOpen && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
 )}

 {/* Mobile drawer */}
 <aside
 className={`fixed left-0 top-0 z-40 flex h-screen w-64 -translate-x-full flex-col border-r border-dark-400/30 bg-dark-900 transition-transform duration-300 ease-out lg:hidden ${isOpen ? 'translate-x-0' : ''}`}
 aria-label="Menú móvil"
 >
 {navContent}
 </aside>
 </>
 );
};

export default Sidebar;
