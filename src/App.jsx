import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import du Context Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// Import des pages
import Portal from './pages/Portal'; 
import Home from './pages/Home';
import Devis from './pages/Devis';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Services from './pages/Services'; 
import Messages from './pages/Messages'; 
import PrivacyPolicy from './pages/PrivacyPolicy'; 

// Dashboards
import EspaceClient from './pages/EspaceClient';
import DashboardAdmin from './pages/DashboardAdmin';

// Import des composants globaux
import Header from './components/Header';
import Footer from './components/Footer';

// --- COMPOSANT DE PROTECTION DE ROUTE OPTIMISÉ ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-eden-dark flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-eden-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userData?.role !== 'admin') {
    // MODIF 1 : Redirection vers espace-client si un non-admin tente d'accéder à l'admin
    return <Navigate to="/espace-client" replace />;
  }

  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  
  const isPortal = location.pathname === '/';
  // MODIF 2 : Mise à jour de la détection pour inclure le nouveau chemin
  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('espace-client');
  const isMessages = location.pathname === '/messages';
  
  const hideLayout = isPortal || isDashboard || isMessages;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] selection:bg-eden-gold/20 selection:text-eden-dark">
      <ScrollToTop />
      
      {!hideLayout && <Header />} 
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutWrapper>
          <Routes>
            {/* PORTAL */}
            <Route path="/" element={<Portal />} />

            {/* Routes Publiques */}
            <Route path="/accueil" element={<Home />} />
            <Route path="/services" element={<Services />} /> 
            <Route path="/devis" element={<Devis />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* PAGE LÉGALE (POINT GOOGLE PLAY CONSOLE) */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* MESSAGERIE PROTÉGÉE */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            {/* Espace Privé Client - AJOUT DU /* POUR LE PROFIL */}
            <Route 
              path="/espace-client/*" 
              element={
                <ProtectedRoute>
                  <EspaceClient />
                </ProtectedRoute>
              } 
            />

            {/* Espace Administration */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardAdmin />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;