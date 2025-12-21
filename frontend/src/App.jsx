import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Settings,
  Trash2,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Star,
  ArrowLeft,
  Server,
  AlertTriangle,
  Bookmark,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  X,
  Box,
  Database,
  Cloud,
  Code,
  Film,
  Download,
  Home,
  Shield,
  Globe,
  Terminal,
  Bug,
  Gamepad,
  Music,
  File,
  Folder,
  LayoutDashboard,
  Layers,
  Video,
  Wifi,
  Lock,
  HardDrive,
  Activity,
  Bell,
  Mail,
  Calendar,
  Book,
  Camera,
  Zap,
  Network,
  Cpu,
  Radio,
  Tv,
  Headphones,
  Rss,
  Archive,
  Key,
  Users,
  MessageSquare,
  Search,
  Wrench,
  Package,
  Smartphone,
  Monitor,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

// Validation and normalization helpers
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Trim whitespace
  url = url.trim();

  // If it already has a protocol, return as is
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Add https:// by default
  return `https://${url}`;
};

const isValidUrl = (url) => {
  if (!url) return false;

  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidPort = (port) => {
  if (!port) return false;
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535 && port.toString() === portNum.toString();
};

// Clean description: trim and remove double spaces
const cleanDescription = (desc) => {
  if (!desc || typeof desc !== 'string') return '';
  return desc.trim().replace(/\s+/g, ' ');
};

const ICONS = {
  // Infrastructure & System
  Server: 'Server',
  Database: 'Database',
  HardDrive: 'HardDrive',
  Cpu: 'Cpu',
  Network: 'Network',

  // Media & Entertainment
  Video: 'Video',
  Film: 'Film',
  Tv: 'Tv',
  Music: 'Music',
  Camera: 'Camera',

  // Networking & Security
  Wifi: 'Wifi',
  Globe: 'Globe',
  Lock: 'Lock',
  Shield: 'Shield',

  // Automation & Monitoring
  Zap: 'Zap',
  Bell: 'Bell',
  Activity: 'Activity',
  Gauge: 'Gauge',

  // Communication
  Mail: 'Mail',
  MessageSquare: 'MessageSquare',
  Users: 'Users',

  // Productivity & Files
  Calendar: 'Calendar',
  Book: 'Book',
  Folder: 'Folder',
  Archive: 'Archive',

  // Development
  Code: 'Code',
  Terminal: 'Terminal',
  Package: 'Package',

  // General
  Home: 'Home',
  Cloud: 'Cloud',
  Download: 'Download',
  Wrench: 'Wrench',
  Gamepad: 'Gamepad'
};

function App() {
  const [view, setView] = useState('dashboard');
  const [shortcuts, setShortcuts] = useState([]);
  const [containers, setContainers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [tailscaleInfo, setTailscaleInfo] = useState({ available: false, ip: null });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTailscaleInfo();

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const fetchTailscaleInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tailscale`);
      setTailscaleInfo(res.data);
    } catch (err) {
      console.error('Failed to fetch Tailscale info', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shortcutsRes, containersRes] = await Promise.all([
        axios.get(`${API_BASE}/shortcuts`),
        axios.get(`${API_BASE}/containers`)
      ]);
      setShortcuts(shortcutsRes.data);
      setContainers(containersRes.data);

      if (shortcutsRes.data.length === 0 && view === 'dashboard') {
        setView('add');
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await axios.post(`${API_BASE}/containers/${id}/start`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStop = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Stop Container',
      message: 'Are you sure you want to stop this container? This will terminate all active processes.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.post(`${API_BASE}/containers/${id}/stop`);
          fetchData();
        } catch (err) { console.error(err); }
      }
    });
  };

  const handleRestart = async (id) => {
    try {
      await axios.post(`${API_BASE}/containers/${id}/restart`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Shortcut',
      message: 'Are you sure you want to delete this shortcut? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/shortcuts/${id}`);
          fetchData();
        } catch (err) { console.error(err); }
      }
    });
  };

  const handleQuickAdd = async (container) => {
    const ports = container.ports.map(p => p.public).filter(Boolean);
    const port = ports[0] || '';  // Empty string instead of 0 for containers without ports

    const formData = new FormData();
    formData.append('name', container.name);
    if (port) {
      formData.append('port', port);  // Only add port if it exists
    }
    formData.append('container_id', container.id);
    formData.append('icon', 'Server');
    // Only add description if it exists and is not empty
    if (container.description && container.description.trim()) {
      formData.append('description', container.description.trim());
    }

    try {
      await axios.post(`${API_BASE}/shortcuts`, formData);
      fetchData();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Failed to add shortcut';
      setErrorModal({
        isOpen: true,
        title: 'Error Adding Shortcut',
        message: errorMessage
      });
    }
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await axios.post(`${API_BASE}/shortcuts/${id}/favorite`, { is_favorite: !currentStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEditModal = (shortcut) => {
    setEditingShortcut(shortcut);
    setIsModalOpen(true);
  };

  const dashboardShortcuts = shortcuts.filter(s => s.is_favorite === 1);
  const customShortcuts = shortcuts.filter(s => !s.container_id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <img src="/dockericon.png" alt="Docker" className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-white">Docker<span className="text-blue-500">Dash</span></h1>
          </button>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {showInstallPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white"
                title="Install DockerDash"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Install</span>
              </button>
            )}
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${view === 'dashboard' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setView('add')}
              className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${view === 'add' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Management</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >


              {dashboardShortcuts.length === 0 && !loading ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                  <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No favorites found</h3>
                  <p className="text-slate-400 mt-2 mb-6">Star your containers or URLs in the management page to see them here.</p>
                  <button
                    onClick={() => setView('add')}
                    className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
                  >
                    Manage your shortcuts
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {dashboardShortcuts.map(s => (
                    <ShortcutCard
                      key={s.id}
                      shortcut={s}
                      container={s.container_id ? containers.find(c => c.id === s.container_id) : null}
                      tailscaleIP={tailscaleInfo.ip}
                      onEdit={() => openEditModal(s)}
                      onDelete={() => handleDelete(s.id)}
                      onStart={() => handleStart(s.container_id)}
                      onStop={() => handleStop(s.container_id)}
                      onRestart={() => handleRestart(s.container_id)}
                      onToggleFavorite={() => handleToggleFavorite(s.id, s.is_favorite)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Manual URL Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LinkIcon className="text-blue-500 w-6 h-6" /> Custom Shortcuts
                      </h2>
                      <p className="text-slate-400 text-sm mt-1">Manual entries not linked to local containers.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingShortcut(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Add Manual Link</span>
                  </button>
                </div>

                {customShortcuts.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl opacity-50">
                    <p className="text-slate-500 text-sm">No manual shortcuts added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customShortcuts.map(s => (
                      <ShortcutCard
                        key={s.id}
                        shortcut={s}
                        container={null}
                        tailscaleIP={tailscaleInfo.ip}
                        onEdit={() => openEditModal(s)}
                        onDelete={() => handleDelete(s.id)}
                        onToggleFavorite={() => handleToggleFavorite(s.id, s.is_favorite)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Containers Section */}
              <section className="space-y-6 pt-6 border-t border-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Server className="text-green-500 w-6 h-6" /> Docker Containers
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Running instances detected on this host.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {containers.map(c => {
                    const existing = shortcuts.find(s => s.container_id === c.id);
                    return (
                      <ContainerCard
                        key={c.id}
                        container={c}
                        isAdded={!!existing}
                        isFavorite={existing?.is_favorite === 1}
                        onQuickAdd={() => handleQuickAdd(c)}
                        onToggleFavorite={() => existing && handleToggleFavorite(existing.id, existing.is_favorite)}
                        onCustomize={() => {
                          const ports = c.ports.map(p => p.public).filter(Boolean);
                          openEditModal(existing || {
                            name: c.name,
                            port: ports[0] || '',
                            container_id: c.id,
                            icon: 'Server',
                            description: ''
                          });
                        }}
                        onStart={() => handleStart(c.id)}
                        onStop={() => handleStop(c.id)}
                      />
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Overlay */}
      <ShortcutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        shortcut={editingShortcut}
        containers={containers}
        tailscaleInfo={tailscaleInfo}
        onError={(title, message) => setErrorModal({ isOpen: true, title, message })}
      />

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <ErrorModal
        {...errorModal}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
      />
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onClose, type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 leading-relaxed">{message}</p>
        </div>

        <div className="p-6 bg-slate-800/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Error Modal - simpler version without confirm button
function ErrorModal({ isOpen, title, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-slate-900 border border-red-500/20 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-red-500/10 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="p-6 bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const ICON_COMPONENTS = {
  // Infrastructure & System
  Server,
  Database,
  HardDrive,
  Cpu,
  Network,
  Activity,
  Gauge,

  // Media & Entertainment
  Video,
  Film,
  Tv,
  Music,
  Headphones,
  Radio,
  Camera,
  ImageIcon,

  // Networking & Security
  Wifi,
  Globe,
  Lock,
  Shield,
  Key,

  // Automation & Monitoring
  Zap,
  Bell,
  Rss,

  // Communication
  Mail,
  MessageSquare,
  Users,

  // Productivity
  Calendar,
  Book,
  File,
  Folder,
  Archive,
  Search,

  // Development
  Code,
  Terminal,
  Bug,
  Package,

  // General
  Home,
  Cloud,
  Download,
  Wrench,
  Gamepad,
  Smartphone,
  Monitor,
  Box
};

const DynamicIcon = ({ name, className }) => {
  const IconComponent = ICON_COMPONENTS[name] || Box;
  return <IconComponent className={className} />;
};

function ShortcutCard({ shortcut, container, tailscaleIP, onEdit, onDelete, onStart, onStop, onRestart, onToggleFavorite }) {
  const isRunning = container?.state === 'running';

  // Determine the link based on use_tailscale setting
  let link = null;
  let subtitle = 'No Link';

  if (shortcut.url) {
    link = shortcut.url;
    subtitle = 'Custom URL';
  } else if (shortcut.port) {
    if (shortcut.use_tailscale && tailscaleIP) {
      link = `http://${tailscaleIP}:${shortcut.port}`;
      subtitle = `Tailscale :${shortcut.port}`;
    } else {
      link = `http://${window.location.hostname}:${shortcut.port}`;
      subtitle = `Port :${shortcut.port}`;
    }
  } else if (container) {
    subtitle = 'Container Only';
  }

  const renderIcon = (isMobileHero = false) => {
    if (shortcut.icon && (shortcut.icon.startsWith('http') || shortcut.icon.includes('/'))) {
      const src = shortcut.icon.startsWith('http') ? shortcut.icon : `/${shortcut.icon}`;
      if (isMobileHero) {
        return <img src={src} alt={shortcut.name} className="w-full h-full object-cover" />;
      }
      return <img src={src} alt={shortcut.name} className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" />;
    }
    if (isMobileHero) {
      return <DynamicIcon name={shortcut.icon} className="w-full h-full text-blue-400" />;
    }
    return <DynamicIcon name={shortcut.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:scale-110 transition-transform duration-500" />;
  };

  const handleCardClick = () => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-slate-900/60 border border-white/5 hover:border-blue-500/30 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 h-full flex flex-col ${link ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Mobile: Full-width Icon/Image with overlay */}
      <div className="sm:hidden relative w-full aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
        {/* Icon/Image - Full size */}
        <div className="w-32 h-32">
          {renderIcon(true)}
        </div>

        {/* Overlay: Title, Subtitle, and Star */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-between p-4">
          {/* Star in top-right */}
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm transition-colors ${shortcut.is_favorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
              title={shortcut.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className={`w-5 h-5 ${shortcut.is_favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Title and Subtitle at bottom */}
          <div>
            <h3 className="text-white font-bold text-base leading-tight uppercase truncate mb-1.5">{shortcut.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded border border-white/10 tracking-wider uppercase truncate">
                {subtitle}
              </span>
              {container && (
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal layout (original) */}
      <div className="hidden sm:flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6">
        {/* Icon */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden">
          {renderIcon()}
        </div>

        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight group-hover:text-blue-400 transition-colors uppercase truncate">{shortcut.name}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-white/5 tracking-wider uppercase truncate">
              {subtitle}
            </span>
            {container && (
              <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
            )}
          </div>
        </div>

        {/* Favorite Star */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`p-1.5 sm:p-2 transition-colors shrink-0 ${shortcut.is_favorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'}`}
          title={shortcut.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-5 h-5 ${shortcut.is_favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description - Below image on mobile, in card on desktop */}
      {shortcut.description && (
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 px-4 sm:px-0 sm:mx-5 md:mx-6 mb-3 sm:mb-4 md:mb-6 flex-1">
          {shortcut.description}
        </p>
      )}

      {/* Action Buttons - Full width on mobile, inline on desktop */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-0 md:px-6 sm:flex sm:items-center sm:justify-between sm:gap-2 sm:mt-auto space-y-2 sm:space-y-0">
        <div className="flex items-center gap-2 sm:gap-1.5">
          {container && (
            <div className="flex gap-2 sm:gap-1.5 flex-1 sm:flex-initial">
              {isRunning ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onStop(); }}
                    className="flex-1 sm:flex-initial p-2.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                    title="Stop Container"
                  >
                    <Square className="w-4 h-4 sm:w-3.5 sm:h-3.5 mx-auto" fill="currentColor" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRestart(); }}
                    className="flex-1 sm:flex-initial p-2.5 sm:p-2 rounded-lg sm:rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all border border-yellow-500/10"
                    title="Restart Container"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 mx-auto" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onStart(); }}
                  className="flex-1 sm:flex-initial p-2.5 sm:p-2 rounded-lg sm:rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all border border-green-500/10"
                  title="Start Container"
                >
                  <Play className="w-4 h-4 sm:w-3.5 sm:h-3.5 mx-auto" fill="currentColor" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 sm:flex-initial p-2.5 sm:p-2 text-slate-400 hover:text-white transition-colors rounded-lg sm:rounded-none bg-slate-800/50 sm:bg-transparent"
            title="Edit Shortcut"
          >
            <Settings className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex-1 sm:flex-initial p-2.5 sm:p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg sm:rounded-none bg-slate-800/50 sm:bg-transparent"
            title="Delete Shortcut"
          >
            <Trash2 className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContainerCard({ container, isAdded, isFavorite, onQuickAdd, onToggleFavorite, onCustomize, onStart, onStop }) {
  const isRunning = container.state === 'running';
  const ports = container.ports.map(p => p.public).filter(Boolean);

  // Determine subtitle based on ports
  let subtitle = 'No ports';
  if (ports.length > 0) {
    subtitle = ports.length === 1 ? `Port :${ports[0]}` : `${ports.length} ports`;
  }

  return (
    <div className="group relative bg-slate-900/60 border border-white/5 hover:border-green-500/30 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/5 h-full flex flex-col">
      {/* Mobile: Full-width Icon with overlay */}
      <div className="sm:hidden relative w-full aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
        {/* Server Icon - Full size */}
        <Server className="w-32 h-32 text-green-400" />

        {/* Overlay: Title, Subtitle, and Star */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-between p-4">
          {/* Star in top-right */}
          <div className="flex justify-end">
            {isAdded ? (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className={`p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm transition-colors ${isFavorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
                className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-yellow-400 transition-colors"
                title="Quick Add to Favorites"
              >
                <Star className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Title and Subtitle at bottom */}
          <div>
            <h3 className="text-white font-bold text-base leading-tight uppercase truncate mb-1.5">{container.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded border border-white/10 tracking-wider uppercase truncate">
                {subtitle}
              </span>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal layout (original) */}
      <div className="hidden sm:flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6">
        {/* Icon - Using Server icon for containers */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden">
          <Server className="w-6 h-6 md:w-7 md:h-7 text-green-400 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight group-hover:text-green-400 transition-colors uppercase truncate">{container.name}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-white/5 tracking-wider uppercase truncate">
              {subtitle}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Favorite Star */}
        {isAdded ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-1.5 sm:p-2 transition-colors shrink-0 ${isFavorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'}`}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
            className="p-1.5 sm:p-2 transition-colors shrink-0 text-slate-500 hover:text-yellow-400"
            title="Quick Add to Favorites"
          >
            <Star className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Description - Below image on mobile, in card on desktop */}
      {container.description && (
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 px-4 sm:px-0 sm:mx-5 md:mx-6 mb-3 sm:mb-4 md:mb-6 flex-1">
          {container.description}
        </p>
      )}

      {/* Action Buttons - Full width on mobile, inline on desktop */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-0 md:px-6 sm:flex sm:items-center sm:justify-between sm:gap-2 sm:mt-auto space-y-2 sm:space-y-0">
        <div className="flex items-center gap-2 sm:gap-1.5">
          {/* Launch button - only show if container has ports */}
          {ports.length > 0 && (
            <button
              onClick={() => window.open(`http://${window.location.hostname}:${ports[0]}`, '_blank')}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-3 py-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Launch"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="sm:hidden">Launch</span><span className="hidden sm:inline">Launch</span>
            </button>
          )}

          {/* Start/Stop buttons */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="flex-1 sm:flex-initial p-2.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
              title="Stop Container"
            >
              <Square className="w-4 h-4 sm:w-3.5 sm:h-3.5 mx-auto" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex-1 sm:flex-initial p-2.5 sm:p-2 rounded-lg sm:rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all border border-green-500/10"
              title="Start Container"
            >
              <Play className="w-4 h-4 sm:w-3.5 sm:h-3.5 mx-auto" fill="currentColor" />
            </button>
          )}
        </div>

        {/* Edit button - Always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-2 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={onCustomize}
            className="flex-1 sm:flex-initial p-2.5 sm:p-2 text-slate-400 hover:text-white transition-colors rounded-lg sm:rounded-none bg-slate-800/50 sm:bg-transparent"
            title="Customize Shortcut"
          >
            <Settings className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortcutModal({ isOpen, onClose, onSave, shortcut, containers, tailscaleInfo, onError }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    port: '',
    url: '',
    icon: 'Server',
    container_id: '',
    type: 'port', // or 'url'
    use_tailscale: false
  });
  const [activeTab, setActiveTab] = useState('icon'); // 'icon', 'url', 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlError, setUrlError] = useState('');
  const [iconUrlError, setIconUrlError] = useState('');

  useEffect(() => {
    if (shortcut) {
      setFormData({
        name: shortcut.name || '',
        description: shortcut.description || '',
        port: shortcut.port || '',
        url: shortcut.url || '',
        icon: shortcut.icon || 'Server',
        container_id: shortcut.container_id || '',
        type: shortcut.url ? 'url' : 'port',
        use_tailscale: shortcut.use_tailscale === 1 || shortcut.use_tailscale === true
      });
      if (shortcut.icon?.startsWith('http')) setActiveTab('url');
      else if (shortcut.icon?.includes('/')) setActiveTab('upload');
      else setActiveTab('icon');
    } else {
      setFormData({
        name: '', description: '', port: '', url: '', icon: 'Server', container_id: '', type: 'port', use_tailscale: false
      });
      setActiveTab('icon');
    }
  }, [shortcut, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setUrlError('');
    setIconUrlError('');

    // Validation
    if (formData.type === 'port') {
      // Port is optional for containers that don't expose ports
      if (formData.port && !isValidPort(formData.port)) {
        onError('Invalid Port Number', 'Please enter a valid port number between 1 and 65535.\n\nNote: Port is optional for containers that don\'t expose any ports.');
        return;
      }
    } else {
      // URL is required for URL-type shortcuts
      if (!formData.url || !isValidUrl(formData.url)) {
        setUrlError('This is not a valid URL. Please enter a valid URL like example.com or https://example.com');
        onError('Invalid URL', 'Please enter a valid URL.\n\nSupported formats:\n• example.com\n• www.example.com\n• http://example.com\n• https://example.com');
        return;
      }
    }

    // Validate image URL if using URL tab
    if (activeTab === 'url' && formData.icon) {
      if (!isValidUrl(formData.icon)) {
        setIconUrlError('This is not a valid URL. Please enter a valid image URL like https://example.com/image.png');
        onError('Invalid Image URL', 'Please enter a valid image URL.\n\nExample: https://example.com/image.png');
        return;
      }
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    // Only add description if it's not empty after cleaning
    const cleanedDesc = cleanDescription(formData.description);
    if (cleanedDesc) {
      data.append('description', cleanedDesc);
    }

    if (formData.type === 'port') {
      // Only add port if it's provided
      if (formData.port) {
        data.append('port', formData.port);
      }
      data.append('use_tailscale', formData.use_tailscale);
    } else {
      // Normalize URL before sending
      data.append('url', normalizeUrl(formData.url));
    }

    if (activeTab === 'icon') data.append('icon', formData.icon);
    else if (activeTab === 'url') data.append('icon', normalizeUrl(formData.icon)); // Normalize image URL
    else if (activeTab === 'upload' && selectedFile) data.append('image', selectedFile);
    else if (shortcut) data.append('icon', shortcut.icon);

    if (formData.container_id) data.append('container_id', formData.container_id);

    try {
      if (shortcut?.id) {
        await axios.put(`${API_BASE}/shortcuts/${shortcut.id}`, data);
      } else {
        await axios.post(`${API_BASE}/shortcuts`, data);
      }
      onSave();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred while saving the shortcut.';
      onError('Error Saving Shortcut', errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/20">
          <h2 className="text-xl font-bold text-white">{shortcut?.id ? 'Edit Shortcut' : 'Create New Shortcut'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Container Selection */}
          {!shortcut?.id && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Link to Container (Optional)</label>
              <select
                value={formData.container_id}
                onChange={(e) => {
                  const c = containers.find(x => x.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    container_id: e.target.value,
                    name: c ? c.name : prev.name,
                    port: c ? (c.ports[0]?.public || '') : prev.port
                  }));
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none"
              >
                <option value="">Manual Entry</option>
                {containers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Display Name</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Plex Media"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Connection Mode</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'port' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'port' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  LOCAL PORT
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'url' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'url' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  WEB URL
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              {formData.type === 'port' ? 'Port Number' : 'Target URL'}
              {formData.type === 'port' && (
                <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
              )}
            </label>
            <input
              required={formData.type === 'url'}
              type={formData.type === 'port' ? 'number' : 'text'}
              min={formData.type === 'port' ? '1' : undefined}
              max={formData.type === 'port' ? '65535' : undefined}
              value={formData.type === 'port' ? formData.port : formData.url}
              onChange={e => {
                setFormData({ ...formData, [formData.type]: e.target.value });
                if (formData.type === 'url') setUrlError(''); // Clear error on change
              }}
              onBlur={e => {
                if (formData.type === 'url' && e.target.value && !isValidUrl(e.target.value)) {
                  setUrlError('This is not a valid URL. Please enter a valid URL like example.com or https://example.com');
                } else {
                  setUrlError('');
                }
              }}
              placeholder={formData.type === 'port' ? '8080 (leave empty if no port)' : 'example.com or https://example.com'}
              className={`w-full bg-slate-800 border ${urlError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${urlError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all text-white`}
            />
            {formData.type === 'port' && (
              <p className="text-xs text-slate-500 pl-1">
                Leave empty for containers that don't expose ports
              </p>
            )}
            {formData.type === 'url' && !urlError && (
              <p className="text-xs text-slate-500 pl-1">
                Supports: example.com, www.example.com, http://example.com, https://example.com
              </p>
            )}
            {urlError && (
              <p className="text-xs text-red-400 pl-1 flex items-center gap-1">
                <span>⚠</span> {urlError}
              </p>
            )}
          </div>

          {/* Tailscale Toggle - Only show for port mode */}
          {formData.type === 'port' && tailscaleInfo.available && (
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-300">Use Tailscale IP</label>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      {tailscaleInfo.ip}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Access this service via your Tailscale network instead of local IP
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, use_tailscale: !formData.use_tailscale })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${formData.use_tailscale ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.use_tailscale ? 'translate-x-7' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this service do?"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-4 pt-2">
            <label className="text-sm font-semibold text-slate-300">Identity & Branding</label>
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-white/10">
              {['icon', 'url', 'upload'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t === 'icon' && <Bookmark className="w-3 h-3" />}
                  {t === 'url' && <LinkIcon className="w-3 h-3" />}
                  {t === 'upload' && <Upload className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 min-h-32 flex items-center justify-center">
              {activeTab === 'icon' && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3 w-full">
                  {Object.keys(ICONS).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconKey })}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === iconKey ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white'}`}
                    >
                      <DynamicIcon name={iconKey} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'url' && (
                <div className="w-full space-y-3">
                  <div className={`flex items-center gap-3 bg-slate-800 border ${iconUrlError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3`}>
                    <LinkIcon className="w-5 h-5 text-slate-500" />
                    <input
                      className="bg-transparent flex-1 focus:outline-none text-white text-sm"
                      placeholder="Paste image link here..."
                      value={formData.icon?.startsWith('http') ? formData.icon : ''}
                      onChange={e => {
                        setFormData({ ...formData, icon: e.target.value });
                        setIconUrlError(''); // Clear error on change
                      }}
                      onBlur={e => {
                        if (e.target.value && !isValidUrl(e.target.value)) {
                          setIconUrlError('This is not a valid URL. Please enter a valid image URL like https://example.com/image.png');
                        } else {
                          setIconUrlError('');
                        }
                      }}
                    />
                  </div>
                  {!iconUrlError && (
                    <p className="text-[10px] text-slate-500 pl-1 italic">Prefer direct links to PNG/SVG assets.</p>
                  )}
                  {iconUrlError && (
                    <p className="text-xs text-red-400 pl-1 flex items-center gap-1">
                      <span>⚠</span> {iconUrlError}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'upload' && (
                <label className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setSelectedFile(e.target.files[0])}
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center text-green-400">
                      <CheckCircle className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-blue-500 mb-1 transition-colors" />
                      <span className="text-xs text-slate-500 group-hover:text-slate-300">Choose local asset</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
            >
              {shortcut?.id ? 'Update Shortcut' : 'Create Shortcut'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default App;
