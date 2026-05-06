import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LayoutGrid, History, Settings, LogOut, Home } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Retour au site', icon: Home, path: '/' },
    { name: 'Mon Profil', icon: User, path: '/dashboard/profile' },
    { name: 'Flux Direct', icon: LayoutGrid, path: '/dashboard/live' },
    { name: 'Historique', icon: History, path: '/dashboard/history' },
    { name: 'Paramètres', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="w-80 h-screen bg-[#07191D] text-white p-8 flex flex-col border-r border-white/5">
      <div className="mb-12">
        <h1 className="text-2xl font-serif text-prestige-cream tracking-tighter">EDÈN</h1>
        <p className="text-[8px] uppercase tracking-[0.4em] text-white/30 font-bold">Private Access</p>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${
                active 
                ? 'border border-eden-gold bg-eden-gold/10 text-white shadow-[0_0_20px_rgba(184,151,106,0.2)]' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-eden-gold' : ''}`} />
              <span className="uppercase tracking-[0.2em] text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button className="flex items-center gap-4 px-6 py-4 text-red-400 hover:text-red-300 transition-colors mt-auto uppercase tracking-[0.2em] text-[10px] font-bold">
        <LogOut className="w-5 h-5" /> Déconnexion
      </button>
    </div>
  );
};

export default Sidebar;