"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Shirt,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Trophy,
  ExternalLink,
  Eye,
  RefreshCw,
  QrCode,
  FileText,
  Plus,
  Trash2,
  Edit,
  Check,
  UploadCloud,
  UserX,
  History,
  Maximize2,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Menu,
  Phone,
  CreditCard,
  FileCheck
} from "lucide-react";
import QRCode from "qrcode";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("players"); // players | teams | sizing | settings | rules | logs
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [rules, setRules] = useState([]);
  const [settings, setSettings] = useState({
    upiId: "shahbazkhandm@okhdfcbank",
    registrationFee: 100,
    maxCapacity: 140,
    adminEmail: "goregaonpremierleague11@gmail.com"
  });
  const [sizing, setSizing] = useState(null);
  const [logs, setLogs] = useState([]);
  const [adminQrPreview, setAdminQrPreview] = useState("");

  // Search & Filters for Players
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");

  // Modals & Active Edit States
  const [inspectPlayer, setInspectPlayer] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [viewSquadTeam, setViewSquadTeam] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null); // { url, title }
  const [newRuleText, setNewRuleText] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadAllData = async () => {
    try {
      const resPlayers = await fetch("/api/admin/players");
      if (resPlayers.status === 401) {
        router.push("/admin/login");
        return;
      }
      const dataPlayers = await resPlayers.json();
      if (dataPlayers.success) {
        setPlayers(dataPlayers.players || []);
        if (dataPlayers.stats) setStats(dataPlayers.stats);
      }

      const resTeams = await fetch("/api/admin/teams");
      const dataTeams = await resTeams.json();
      if (dataTeams.success) setTeams(dataTeams.teams || []);

      const resSettings = await fetch("/api/admin/settings");
      const dataSettings = await resSettings.json();
      if (dataSettings.success) setSettings(dataSettings.settings || {});

      const resRules = await fetch("/api/admin/rules");
      const dataRules = await resRules.json();
      if (dataRules.success) setRules(dataRules.rules || []);

      const resSizing = await fetch("/api/admin/sizing");
      const dataSizing = await resSizing.json();
      if (dataSizing.success) setSizing(dataSizing.matrix);

      const resLogs = await fetch("/api/admin/logs");
      const dataLogs = await resLogs.json();
      if (dataLogs.success) setLogs(dataLogs.logs || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initDashboard() {
      try {
        const resPlayers = await fetch("/api/admin/players");
        if (resPlayers.status === 401) {
          router.push("/admin/login");
          return;
        }
        const dataPlayers = await resPlayers.json();
        if (isMounted && dataPlayers.success) {
          setPlayers(dataPlayers.players || []);
          if (dataPlayers.stats) setStats(dataPlayers.stats);
        }

        const resTeams = await fetch("/api/admin/teams");
        const dataTeams = await resTeams.json();
        if (isMounted && dataTeams.success) setTeams(dataTeams.teams || []);

        const resSettings = await fetch("/api/admin/settings");
        const dataSettings = await resSettings.json();
        if (isMounted && dataSettings.success) setSettings(dataSettings.settings || {});

        const resRules = await fetch("/api/admin/rules");
        const dataRules = await resRules.json();
        if (isMounted && dataRules.success) setRules(dataRules.rules || []);

        const resSizing = await fetch("/api/admin/sizing");
        const dataSizing = await resSizing.json();
        if (isMounted && dataSizing.success) setSizing(dataSizing.matrix);

        const resLogs = await fetch("/api/admin/logs");
        const dataLogs = await resLogs.json();
        if (isMounted && dataLogs.success) setLogs(dataLogs.logs || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initDashboard();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Update Dynamic QR Preview when UPI ID or fee changes
  useEffect(() => {
    async function genPreview() {
      try {
        const uri = `upi://pay?pa=${encodeURIComponent(settings.upiId || "shahbazkhandm@okhdfcbank")}&pn=${encodeURIComponent("Goregaon Premier League")}&am=${encodeURIComponent(settings.registrationFee || 100)}&cu=INR&tn=${encodeURIComponent("GPL Player Registration")}`;
        const dataUrl = await QRCode.toDataURL(uri, {
          width: 260,
          margin: 1.5,
          color: { dark: "#081a36", light: "#ffffff" }
        });
        setAdminQrPreview(dataUrl);
      } catch (e) {}
    }
    genPreview();
  }, [settings.upiId, settings.registrationFee]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // --- PLAYER ACTIONS ---
  const handleUpdateStatus = async (playerId, newStatus) => {
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, paymentStatus: newStatus } : p))
        );
        if (inspectPlayer && inspectPlayer.id === playerId) {
          setInspectPlayer(null);
        }
        if (data.stats) setStats(data.stats);
        showToast(`Registration marked as ${newStatus}!`, "success");
      }
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error");
    }
  };

  const handleSavePlayerEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          id: editPlayer.id,
          playerData: editPlayer
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(data.players);
        setEditPlayer(null);
        if (inspectPlayer && inspectPlayer.id === editPlayer.id) {
          setInspectPlayer(data.player);
        }
        showToast("Player details updated successfully!", "success");
      }
    } catch (err) {
      showToast("Failed to update player: " + err.message, "error");
    }
  };

  const handleDeletePlayer = (playerId) => {
    setConfirmModal({
      title: "Delete Player Registration",
      message: "Are you sure you want to permanently delete this registration? All submitted documents will be removed.",
      confirmText: "Yes, Delete Player",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id: playerId }),
          });
          const data = await res.json();
          if (data.success) {
            setPlayers(data.players);
            if (data.stats) setStats(data.stats);
            if (inspectPlayer && inspectPlayer.id === playerId) setInspectPlayer(null);
            showToast("Player registration deleted successfully!", "success");
          }
        } catch (err) {
          showToast("Failed to delete player: " + err.message, "error");
        }
      }
    });
  };

  const handleAssignTeam = async (playerId, teamId) => {
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", playerId, teamId: teamId || null }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, teamId: teamId || null } : p))
        );
        loadAllData();
      }
    } catch (err) {
      showToast("Failed to assign team: " + err.message, "error");
    }
  };

  // --- SETTINGS SAVE ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSettingsMsg("Settings & Dynamic UPI details updated successfully!");
        setTimeout(() => setSettingsMsg(""), 3000);
      }
    } catch (err) {
      showToast("Failed to save settings: " + err.message, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // --- TEAM SAVE & LOGO UPLOAD ---
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editTeam.id ? "update" : "create",
          teamId: editTeam.id,
          teamData: editTeam
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
        setEditTeam(null);
        showToast("Team saved successfully!", "success");
      }
    } catch (err) {
      showToast("Failed to save team: " + err.message, "error");
    }
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmModal({
      title: "Delete Team",
      message: "Are you sure you want to delete this team? Assigned players will be unassigned.",
      confirmText: "Delete Team",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", teamId }),
          });
          const data = await res.json();
          if (data.success) {
            setTeams(data.teams);
            loadAllData();
            showToast("Team deleted successfully!", "success");
          }
        } catch (err) {
          showToast("Failed to delete team: " + err.message, "error");
        }
      }
    });
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("prefix", "team_logo");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setEditTeam((prev) => ({ ...prev, logo: data.url }));
      }
    } catch (err) {
      showToast("Logo upload failed: " + err.message, "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- RULES MANAGER ---
  const handleAddRule = async () => {
    if (!newRuleText.trim()) return;
    const updated = [...rules, newRuleText.trim()];
    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
        setNewRuleText("");
      }
    } catch (err) {
      showToast("Failed to add rule: " + err.message, "error");
    }
  };

  const handleDeleteRule = async (idx) => {
    const updated = rules.filter((_, i) => i !== idx);
    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updated }),
      });
      const data = await res.json();
      if (data.success) setRules(data.rules);
    } catch (err) {
      showToast("Failed to delete rule: " + err.message, "error");
    }
  };

  // Filtered Players
  const filteredPlayers = players.filter((p) => {
    const matchesQuery =
      searchQuery === "" ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || p.paymentStatus === statusFilter;

    const matchesWard =
      wardFilter === "ALL" || p.ward === wardFilter;

    return matchesQuery && matchesStatus && matchesWard;
  });

  const tabItems = [
    { id: "players", label: `Players (${players.length})`, icon: Users },
    { id: "teams", label: `Teams (${teams.length})`, icon: Trophy },
    { id: "sizing", label: "Kit Sizing", icon: Shirt },
    { id: "settings", label: "Payment & Settings", icon: QrCode },
    { id: "rules", label: "Rules", icon: FileText },
    { id: "logs", label: "Logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slideUp ${
          toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
        }`}>
          {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header - GPL Royal Navy Theme with Responsive Mobile Hamburger */}
      <header className="bg-[#081a36] text-white sticky top-0 z-40 shadow-md border-b border-white/10">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 shrink-0 shadow-sm flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="GPL Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
                  GPL Console
                </h1>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-mono font-bold border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Radhe Radhe Chashak • Mohsin Patel &amp; Balram Gupta (Ballu) 
              </p>
            </div>
          </div>

          {/* Desktop Top Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <a
              href="/api/admin/export"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0041b9] hover:bg-[#003399] text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold border border-red-500/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="/api/admin/export"
              download
              className="p-2 rounded-lg bg-[#0041b9] text-white text-xs"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Toggle Admin Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a1f42] border-t border-white/10 px-4 py-4 space-y-3 shadow-2xl animate-fadeIn">
            
            {/* Quick Tab Switcher inside Hamburger */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                Navigation Tabs
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        activeTab === tab.id
                          ? "bg-[#0041b9] text-white shadow-sm"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  <span>View Public Website</span>
                </span>
                <span className="text-[10px] text-slate-300">Live Portal ↗</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin Console</span>
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* KPI Tiles Container: Responsive 2-col on Mobile, 6-col on Desktop */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            
            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Total Registered
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-3xl font-extrabold text-[#081a36]">
                  {stats.totalRegistered}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">/ {stats.maxCapacity}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-blue-600 font-semibold block mt-0.5 sm:mt-1 truncate">
                {stats.remainingSlots} slots left
              </span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-200/80 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Approved
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-emerald-700">
                {stats.approved}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Auction eligible</span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200/80 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Pending Review
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-amber-700">
                {stats.pending}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Needs verification</span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-red-200/80 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Rejected
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-red-700">
                {stats.rejected}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Non-eligible</span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Franchises
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-[#081a36]">
                {teams.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Teams active</span>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Collected Fees
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-purple-700">
                ₹{stats.totalRegistered * (settings.registrationFee || 100)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">₹{settings.registrationFee || 100} / player</span>
            </div>

          </div>
        )}

        {/* Navigation Tabs (Smooth Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar select-none">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#0041b9] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PLAYER REGISTRATIONS (Table on Desktop / Cards on Mobile) */}
        {/* ========================================================================= */}
        {activeTab === "players" && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Search & Filters */}
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player, phone, ID, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Wards</option>
                  <option value="Ward 51">Ward 51</option>
                  <option value="Ward 54">Ward 54</option>
                  <option value="Other Ward">Other Ward</option>
                </select>

                <button
                  onClick={loadAllData}
                  className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Refresh</span>
                </button>
              </div>
            </div>

            {/* Mobile Player Cards View (< lg) */}
            <div className="block lg:hidden space-y-3">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    {/* Top Row: Name, Reg ID & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{player.name}</h3>
                        <span className="text-xs font-mono font-bold text-blue-600 block mt-0.5">
                          {player.regNumber || (player.id ? player.id.replace(/\D/g, "") : "")}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shrink-0 ${
                          player.paymentStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : player.paymentStatus === "Rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          player.paymentStatus === "Approved"
                            ? "bg-emerald-500"
                            : player.paymentStatus === "Rejected"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`} />
                        <span>{player.paymentStatus}</span>
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                        <a href={`tel:${player.phone}`} className="font-semibold text-blue-600 block">
                          {player.phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Ward &amp; Role</span>
                        <span className="font-semibold text-slate-800 text-[11px] block leading-snug break-words">
                          {player.ward} • {player.speciality}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Kit Sizing</span>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          T: {player.tshirtSize} | P: {player.trackSize}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment UTR</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] block break-all leading-tight">
                          {player.utrNumber || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Documents Lightbox Row (3 columns, guaranteed 0 horizontal overflow) */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.aadhaarFrontUrl, title: `Aadhaar Front - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-blue-50 text-[#0041b9] text-[11px] font-semibold border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors min-w-0"
                      >
                        <FileCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Aadhaar F</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.aadhaarBackUrl, title: `Aadhaar Back - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-blue-50 text-[#0041b9] text-[11px] font-semibold border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors min-w-0"
                      >
                        <FileCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Aadhaar B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.paymentProofUrl, title: `Payment Receipt - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-100 hover:bg-purple-100 flex items-center justify-center gap-1 transition-colors min-w-0"
                      >
                        <CreditCard className="w-3 h-3 shrink-0" />
                        <span className="truncate">Receipt</span>
                      </button>
                    </div>

                    {/* Team Selector */}
                    <div>
                      <select
                        value={player.teamId || ""}
                        onChange={(e) => handleAssignTeam(player.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                      >
                        <option value="">— Unassigned (Auction Pool) —</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.shortCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {player.paymentStatus !== "Approved" && (
                        <button
                          onClick={() => handleUpdateStatus(player.id, "Approved")}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Approve
                        </button>
                      )}

                      {player.paymentStatus !== "Rejected" && (
                        <button
                          onClick={() => handleUpdateStatus(player.id, "Rejected")}
                          className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => setEditPlayer(player)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Edit Player"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setInspectPlayer(player)}
                        className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100"
                        title="Inspect Player"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        title="Delete Player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No registrations found matching your filters.
                </div>
              )}
            </div>

            {/* Desktop Full Data Table (>= lg) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Player</th>
                      <th className="py-4 px-5">Role &amp; Ward</th>
                      <th className="py-4 px-5">Kit Size</th>
                      <th className="py-4 px-5">Payment UTR</th>
                      <th className="py-4 px-5">Documents</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Assigned Team</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => {
                        return (
                          <tr key={player.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-900 text-sm">{player.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{player.phone}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-800">{player.speciality}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{player.ward || "Ward 51"}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono font-bold text-xs text-slate-700">
                                {player.tshirtSize} / {player.trackSize}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-mono text-xs font-semibold text-slate-800">{player.utrNumber || "N/A"}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setFullScreenImage({ url: player.aadhaarFrontUrl, title: `Aadhaar Front - ${player.name}` })}
                                  className="p-1 rounded bg-blue-50 text-[#0041b9] hover:bg-blue-100 font-mono text-[10px] px-1.5"
                                  title="Aadhaar Front"
                                >
                                  AF
                                </button>
                                <button
                                  onClick={() => setFullScreenImage({ url: player.aadhaarBackUrl, title: `Aadhaar Back - ${player.name}` })}
                                  className="p-1 rounded bg-blue-50 text-[#0041b9] hover:bg-blue-100 font-mono text-[10px] px-1.5"
                                  title="Aadhaar Back"
                                >
                                  AB
                                </button>
                                <button
                                  onClick={() => setFullScreenImage({ url: player.paymentProofUrl, title: `Payment Proof - ${player.name}` })}
                                  className="p-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-mono text-[10px] px-1.5"
                                  title="Receipt"
                                >
                                  Pay
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                  player.paymentStatus === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : player.paymentStatus === "Rejected"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  player.paymentStatus === "Approved"
                                    ? "bg-emerald-500"
                                    : player.paymentStatus === "Rejected"
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                                }`} />
                                <span>{player.paymentStatus}</span>
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <select
                                value={player.teamId || ""}
                                onChange={(e) => handleAssignTeam(player.id, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                              >
                                <option value="">— Unassigned —</option>
                                {teams.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {player.paymentStatus !== "Approved" && (
                                  <button
                                    onClick={() => handleUpdateStatus(player.id, "Approved")}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    title="Approve Player"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {player.paymentStatus !== "Rejected" && (
                                  <button
                                    onClick={() => handleUpdateStatus(player.id, "Rejected")}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                    title="Reject Player"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setInspectPlayer(player)}
                                  className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100"
                                  title="Inspect Documents"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditPlayer(player)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  title="Edit Player"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePlayer(player.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Delete Registration"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No player registrations found matching your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FRANCHISES & SQUADS */}
        {/* ========================================================================= */}
        {activeTab === "teams" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Tournament Teams &amp; Squads</h2>
                <p className="text-xs text-slate-500">Manage 10 tournament teams, owners, captains, and auction allocations</p>
              </div>
              <button
                onClick={() => setEditTeam({ name: "", shortCode: "", owner: "", captain: "", logo: "" })}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0041b9] hover:bg-[#003399] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Team</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teams.map((team) => {
                const memberCount = team.members ? team.members.length : 0;
                return (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{team.name}</h3>
                        <span className="text-xs font-mono font-bold text-[#0041b9]">Code: {team.shortCode}</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setViewSquadTeam(team)}
                      className="space-y-1 text-xs bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-100 cursor-pointer transition-colors"
                      title="Click to view assigned team players"
                    >
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner:</span>
                        <span className="font-bold text-slate-700">{team.owner || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Captain:</span>
                        <span className="font-bold text-slate-700">{team.captain || "N/A"}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-400">Squad:</span>
                        <span className="font-mono font-bold text-[#0041b9] flex items-center gap-1">
                          <span>{players.filter((p) => p.teamId === team.id).length} / 14 Players</span>
                          <span className="text-[10px] text-blue-600 font-sans font-semibold ml-1 underline">View Roster ↗</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setViewSquadTeam(team)}
                        className="flex-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0041b9] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>View Players ({players.filter((p) => p.teamId === team.id).length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditTeam(team)}
                        className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VENDOR KIT SIZING MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "sizing" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Vendor Apparel &amp; Kit Orders</h2>
                <p className="text-xs text-slate-500">Live breakdown of player uniform sizes for tracksuits and jerseys</p>
              </div>
              <a
                href="/api/admin/export"
                download
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0041b9] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Sizing Sheet</span>
              </a>
            </div>

            {sizing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* T-Shirt Breakdown */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#081a36] uppercase tracking-wider">
                    T-Shirt Size Distribution
                  </h3>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(sizing.tshirts || {}).map(([size, count]) => (
                        <tr key={size}>
                          <td className="py-2 px-3 font-bold text-slate-800">{size}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-600">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Track Pant Breakdown */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#081a36] uppercase tracking-wider">
                    Track Pant Size Distribution
                  </h3>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Waist Size</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(sizing.tracks || {}).map(([size, count]) => (
                        <tr key={size}>
                          <td className="py-2 px-3 font-bold text-slate-800">{size}&quot;</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-600">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PAYMENT QR & TOURNAMENT SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
            
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Payment &amp; Dynamic UPI QR Settings</h2>
              <p className="text-xs text-slate-500">Update UPI ID, registration fee amount, and tournament capacity. The QR code on the website will dynamically generate and update with the exact amount.</p>
            </div>

            {settingsMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{settingsMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payee UPI ID (Google Pay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  required
                  placeholder="example@okhdfcbank"
                  value={settings.upiId || ""}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Fee (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={settings.registrationFee || 100}
                  onChange={(e) => setSettings({ ...settings, registrationFee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Notification Email Address
                </label>
                <input
                  type="email"
                  required
                  value={settings.adminEmail || "goregaonpremierleague11@gmail.com"}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              {/* Dynamic QR Live Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-32 bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-center shrink-0">
                  {adminQrPreview ? (
                    <img src={adminQrPreview} alt="Live QR Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Generating...</span>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900">Live Dynamic UPI QR Code Preview</h4>
                  <p className="text-[11px] text-slate-500">
                    This QR code automatically encodes UPI ID <strong>{settings.upiId}</strong> with the pre-filled payment fee of <strong>₹{settings.registrationFee}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 rounded-xl bg-[#0041b9] hover:bg-[#003399] disabled:bg-slate-400 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  {savingSettings ? "Saving Settings..." : "Save Tournament Settings"}
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TOURNAMENT RULES */}
        {/* ========================================================================= */}
        {activeTab === "rules" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
            
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Official Tournament Rules &amp; Regulations</h2>
              <p className="text-xs text-slate-500">Live rules displayed to prospective players on the public portal</p>
            </div>

            <div className="space-y-2.5">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0041b9] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 leading-relaxed font-medium">{rule}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Rule Textarea (3 lines) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Add New Tournament Rule</label>
              <textarea
                rows={3}
                placeholder="Type new tournament rule here (e.g. Batsman must wear mandatory helmet while batting)..."
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#0041b9] outline-none resize-none leading-relaxed bg-slate-50 focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddRule}
                  disabled={!newRuleText.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0041b9] hover:bg-[#003399] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY ACTIVITY LOGS */}
        {/* ========================================================================= */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Security Audit &amp; Activity Logs</h2>
              <p className="text-xs text-slate-500">Immutable trace of all administrative status changes, team assignments, and logins</p>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {logs.map((log) => {
                const isApproval = log.action === "STATUS_UPDATED" && log.details?.status === "Approved";
                const isReject = log.action === "STATUS_UPDATED" && log.details?.status === "Rejected";
                const isDelete = log.action?.includes("DELETED");

                let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                if (isApproval) badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                else if (isReject || isDelete) badgeClass = "bg-red-50 text-red-700 border-red-200";
                else if (log.action === "PLAYER_REGISTERED") badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                else if (log.action?.includes("SETTINGS")) badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                else if (log.action?.includes("TEAM")) badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                let detailsDisplay = "";
                if (typeof log.details === "object" && log.details !== null) {
                  detailsDisplay = Object.entries(log.details)
                    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                    .join(" • ");
                } else {
                  detailsDisplay = String(log.details || "");
                }

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold ${badgeClass}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </span>
                    </div>
                    <div className="text-slate-700 font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-100/80 break-words leading-relaxed">
                      {detailsDisplay || "No additional payload"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: INSPECT PLAYER FULL DETAILS */}
      {/* ========================================================================= */}
      {inspectPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 animate-scaleUp">
            
            <button
              onClick={() => setInspectPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0041b9] flex items-center justify-center font-bold text-lg">
                {inspectPlayer.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{inspectPlayer.name}</h3>
                <span className="text-xs font-mono text-slate-400">{inspectPlayer.id} • {inspectPlayer.phone}</span>
              </div>
            </div>

            {/* Document Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Aadhaar Front */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Front</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.aadhaarFrontUrl, title: `Aadhaar Card Front - ${inspectPlayer.name}` })}
                  className="h-32 sm:h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.aadhaarFrontUrl} alt="Aadhaar Front" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Aadhaar Back */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Back</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.aadhaarBackUrl, title: `Aadhaar Card Back - ${inspectPlayer.name}` })}
                  className="h-32 sm:h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.aadhaarBackUrl} alt="Aadhaar Back" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Payment Proof</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.paymentProofUrl, title: `Payment Receipt - ${inspectPlayer.name}` })}
                  className="h-32 sm:h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.paymentProofUrl} alt="Payment Proof" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UTR Number</span>
                <span className="font-mono font-bold text-slate-900 truncate block">{inspectPlayer.utrNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Speciality</span>
                <span className="font-bold text-slate-900 truncate block">{inspectPlayer.speciality}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Uniform Kit</span>
                <span className="font-mono font-bold text-[#0041b9]">T: {inspectPlayer.tshirtSize} | P: {inspectPlayer.trackSize}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus(inspectPlayer.id, "Approved")}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Approve Player
              </button>
              <button
                onClick={() => handleUpdateStatus(inspectPlayer.id, "Rejected")}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Reject Player
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL-SCREEN IMAGE ZOOM LIGHTBOX */}
      {/* ========================================================================= */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4">
          
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-2 sm:mb-4 px-2">
            <span className="text-xs sm:text-base font-bold truncate pr-4">{fullScreenImage.title}</span>
            <button
              onClick={() => setFullScreenImage(null)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors shrink-0"
              title="Close Image View"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center p-2">
            <img
              src={fullScreenImage.url}
              alt={fullScreenImage.title}
              className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PLAYER DETAILS */}
      {/* ========================================================================= */}
      {editPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setEditPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">Edit Player: {editPlayer.name}</h3>

            <form onSubmit={handleSavePlayerEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editPlayer.name || ""}
                  onChange={(e) => setEditPlayer({ ...editPlayer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="player@example.com"
                  value={editPlayer.email || ""}
                  onChange={(e) => setEditPlayer({ ...editPlayer, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPlayer.phone}
                    onChange={(e) => setEditPlayer({ ...editPlayer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ward</label>
                  <select
                    value={editPlayer.ward}
                    onChange={(e) => setEditPlayer({ ...editPlayer, ward: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="Ward 51">Ward 51</option>
                    <option value="Ward 54">Ward 54</option>
                    <option value="Other Ward">Other Ward</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">T-shirt Size</label>
                  <select
                    value={editPlayer.tshirtSize}
                    onChange={(e) => setEditPlayer({ ...editPlayer, tshirtSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="X-large">X-large</option>
                    <option value="XX-Large">XX-Large</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Track Size</label>
                  <select
                    value={editPlayer.trackSize}
                    onChange={(e) => setEditPlayer({ ...editPlayer, trackSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="30">30</option>
                    <option value="32">32</option>
                    <option value="34">34</option>
                    <option value="36">36</option>
                    <option value="38">38</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment UTR Number</label>
                <input
                  type="text"
                  value={editPlayer.utrNumber}
                  onChange={(e) => setEditPlayer({ ...editPlayer, utrNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditPlayer(null)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#0041b9] hover:bg-[#003399] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT FRANCHISE TEAM */}
      {/* ========================================================================= */}
      {editTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setEditTeam(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {editTeam.id ? `Edit Team: ${editTeam.name}` : "Create New Team"}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colony Super Kings"
                  value={editTeam.name || ""}
                  onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Short Code (3 Letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="CSK"
                    value={editTeam.shortCode || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, shortCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Team Owner</label>
                  <input
                    type="text"
                    placeholder="Owner name(s)"
                    value={editTeam.owner || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Captain</label>
                <input
                  type="text"
                  placeholder="Captain name"
                  value={editTeam.captain || ""}
                  onChange={(e) => setEditTeam({ ...editTeam, captain: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Logo Badge</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    {editTeam.logo ? (
                      <img src={editTeam.logo} alt="Team Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <span className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold block text-center">
                      {uploadingLogo ? "Uploading Logo..." : "Upload Logo Image"}
                    </span>
                    <input type="file" accept="image/*" onChange={handleUploadLogo} className="sr-only" />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditTeam(null)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#0041b9] hover:bg-[#003399] text-white font-bold"
                >
                  Save Team
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

            {/* ========================================================================= */}
      {/* MODAL: VIEW TEAM PLAYERS / SQUAD ROSTER */}
      {/* ========================================================================= */}
      {viewSquadTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  {viewSquadTeam.logo ? (
                    <img src={viewSquadTeam.logo} alt={viewSquadTeam.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Trophy className="w-6 h-6 text-[#0041b9]" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{viewSquadTeam.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="font-mono font-bold text-blue-600">Code: {viewSquadTeam.shortCode}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">
                      {players.filter((p) => p.teamId === viewSquadTeam.id).length} / 14 Players Assigned
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewSquadTeam(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Squad List */}
            <div className="flex-1 overflow-y-auto py-1 space-y-2 max-h-[55vh] pr-1">
              {players.filter((p) => p.teamId === viewSquadTeam.id).length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No players assigned to this team yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Go to the Registrations tab to assign approved auction pool players to {viewSquadTeam.name}.
                  </p>
                </div>
              ) : (
                players
                  .filter((p) => p.teamId === viewSquadTeam.id)
                  .map((player, idx) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0041b9] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 truncate">{player.name}</h4>
                            <span className="font-mono font-bold text-blue-600 text-[11px]">
                              #{player.regNumber || (player.id ? player.id.replace(/\D/g, "") : "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mt-0.5">
                            <span className="font-medium text-slate-700">{player.speciality}</span>
                            <span>•</span>
                            <span>{player.ward}</span>
                            <span>•</span>
                            <span className="font-mono font-semibold">T:{player.tshirtSize} | P:{player.trackSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectPlayer(player);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAssignTeam(player.id, "");
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Remove from Team"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500 text-[11px]">
                Owner: <span className="font-bold text-slate-700">{viewSquadTeam.owner || "N/A"}</span> • Captain: <span className="font-bold text-slate-700">{viewSquadTeam.captain || "N/A"}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewSquadTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
