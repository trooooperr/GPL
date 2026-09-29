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
  AlertTriangle
} from "lucide-react";
import QRCode from "qrcode";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("players"); // players | teams | sizing | settings | rules | logs
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
    maxCapacity: 168,
    adminEmail: "goregaonpremierleague@gmail.com"
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
        // Dismiss modal immediately when approved or rejected
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
      showToast("Failed to assign franchise: " + err.message, "error");
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
        showToast("Team details saved successfully!", "success");
      }
    } catch (err) {
      showToast("Failed to save team: " + err.message, "error");
    }
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmModal({
      title: "Delete Franchise Team",
      message: "Are you sure you want to delete this team franchise? Assigned players will be unassigned.",
      confirmText: "Yes, Delete Team",
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
            showToast("Franchise team deleted successfully!", "success");
          }
        } catch (err) {
          showToast("Failed to delete team: " + err.message, "error");
        }
      }
    });
  };

  const handleUploadTeamLogo = async (e) => {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Top Header - GPL Royal Navy Theme */}
      <header className="bg-[#081a36] text-white sticky top-0 z-40 shadow-md border-b border-white/10">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 shrink-0 shadow-sm flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="GPL Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  GPL Control Console
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Radhe Radhe Chashak • Mohsin Patel & Balram Gupta (Ballu) 
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              <span className="hidden sm:inline">Export CSV</span>
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

        </div>
      </header>

      {/* Main Wide Container */}
      <main className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Tiles Container */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Registered
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#081a36]">
                  {stats.totalRegistered}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ {stats.maxCapacity}</span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                {stats.remainingSlots} slots left
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Approved
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {stats.approved}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Auction eligible</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Pending Review
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                {stats.pending}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Needs verification</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                Rejected
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-red-700">
                {stats.rejected}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Non-eligible</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Franchises
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#081a36]">
                {teams.length}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Teams active</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                Collected Fees
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">
                ₹{stats.totalRegistered * (settings.registrationFee || 100)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">₹{settings.registrationFee || 100} / player</span>
            </div>

          </div>
        )}

        {/* Navigation Tabs (Ordered with Kit Sizing before Payment) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "players"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Player Registrations ({players.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "teams"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{teams.length} Franchises &amp; Squads</span>
          </button>

          <button
            onClick={() => setActiveTab("sizing")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "sizing"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Kit Sizing Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "settings"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Payment QR &amp; Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "rules"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rules &amp; Regulations</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "logs"
                ? "bg-[#0041b9] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Logs</span>
          </button>

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PLAYER REGISTRATIONS TABLE */}
        {/* ========================================================================= */}
        {activeTab === "players" && (
          <div className="space-y-6">
            
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player by name, phone, reg ID, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Wards</option>
                  <option value="Ward 51">Ward 51</option>
                  <option value="Ward 54">Ward 54</option>
                  <option value="Other Ward">Other Ward</option>
                </select>

                <button
                  onClick={loadAllData}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Players Table - Clean, Spacious & Breathable Design */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Player</th>
                      <th className="py-4 px-5">Role &amp; Ward</th>
                      <th className="py-4 px-5">Kit Size</th>
                      <th className="py-4 px-5">Payment UTR</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Franchise</th>
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
                              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">₹{player.amount || 100} Paid</div>
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
                                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0041b9]"
                              >
                                <option value="">Unassigned</option>
                                {teams.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectPlayer(player)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-[#0041b9] hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all active:scale-95"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => setEditPlayer(player)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Edit Details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePlayer(player.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete"
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
                        <td colSpan="7" className="py-12 text-center text-slate-400">
                          No registered players found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === "teams" && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#081a36]">Franchise Team Management</h2>
                <p className="text-xs text-slate-500">Manage {teams.length} teams, update logos, owners, captains and squad rosters</p>
              </div>
              <button
                onClick={() =>
                  setEditTeam({
                    name: "",
                    shortCode: "",
                    owner: "",
                    captain: "",
                    logo: ""
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#0041b9] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Franchise</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {teams.map((team) => {
                const memberCount = team.members ? team.members.length : (team.memberDetails ? team.memberDetails.length : 0);
                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center">
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

                    <div className="space-y-1 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
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
                        <span className="font-mono font-bold text-[#0041b9]">{memberCount} / 14 Players</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setEditTeam(team)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#081a36]">Vendor Apparel &amp; Kit Orders</h2>
                <p className="text-xs text-slate-500">Live breakdown of player uniform sizes for tracksuits and jerseys</p>
              </div>
              <a
                href="/api/admin/export"
                download
                className="px-4 py-2 rounded-xl bg-[#0041b9] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Sizing Sheet</span>
              </a>
            </div>

            {sizing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* T-Shirt Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
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
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
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
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div>
              <h2 className="text-xl font-bold text-[#081a36]">Payment &amp; Dynamic UPI QR Settings</h2>
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Fee Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.registrationFee || 100}
                    onChange={(e) => setSettings({ ...settings, registrationFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0041b9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tournament Max Player Capacity
                  </label>
                  <input
                    type="number"
                    value={settings.maxCapacity || 168}
                    onChange={(e) => setSettings({ ...settings, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0041b9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Notification Gmail (Instant Registration Alerts)
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={settings.adminEmail || ""}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0041b9]"
                />
              </div>

              {/* Dynamic QR Preview Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-700">
                  Dynamic UPI QR Preview (Encodes ₹{settings.registrationFee || 100} to {settings.upiId || "UPI ID"})
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-28 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
                    {adminQrPreview ? (
                      <img src={adminQrPreview} alt="Dynamic UPI QR" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This QR code is generated dynamically in real time. Whenever players scan it, their UPI payment app will automatically open with <strong>₹{settings.registrationFee || 100}</strong> pre-filled to <strong>{settings.upiId}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 rounded-xl bg-[#0041b9] hover:bg-[#003399] text-white font-bold text-sm shadow-sm transition-all"
              >
                {savingSettings ? "Saving Settings..." : "Save All Settings & Sync QR"}
              </button>

            </form>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RULES & REGULATIONS MANAGER */}
        {/* ========================================================================= */}
        {activeTab === "rules" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div>
              <h2 className="text-xl font-bold text-[#081a36]">Rules &amp; Regulations Manager</h2>
              <p className="text-xs text-slate-500">Edit existing rules or add new tournament guidelines displayed on the public site.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter new tournament rule..."
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0041b9]"
              />
              <button
                onClick={handleAddRule}
                className="px-5 py-2.5 rounded-xl bg-[#0041b9] text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-800">{rule}</span>
                  <button
                    onClick={() => handleDeleteRule(idx)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT & ACTIVITY LOGS */}
        {/* ========================================================================= */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-[#081a36]">System Audit &amp; Activity Trail</h2>
            <div className="divide-y divide-slate-100 text-xs max-h-[600px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono font-bold text-[#0041b9] block">{log.action}</span>
                    <p className="text-slate-600 mt-0.5">{JSON.stringify(log.details)}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: PLAYER INSPECTION & DOCUMENT ZOOM */}
      {/* ========================================================================= */}
            
      {/* Sleek Built-in Confirmation Dialog Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.title || "Are you sure?"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal(null);
                  if (fn) fn();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                {confirmModal.confirmText || "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Built-in Notification Popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 animate-bounceIn flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold transition-all ${
          toast.type === "error"
            ? "bg-red-950 text-red-100 border-red-800"
            : "bg-[#081a36] text-white border-blue-500/30"
        }`}>
          {toast.type === "error" ? (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {inspectPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-slate-900 truncate">{inspectPlayer.name}</h3>
                <span className="text-xs font-mono text-[#0041b9] font-bold block mt-0.5">{inspectPlayer.id} • {inspectPlayer.ward}</span>
              </div>
              
              {/* Action Buttons + Close X cleanly grouped together */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleUpdateStatus(inspectPlayer.id, "Approved")}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(inspectPlayer.id, "Rejected")}
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <UserX className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button
                  onClick={() => setInspectPlayer(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Previews (Click to Fullscreen Zoom) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Aadhaar Front */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Aadhaar Front</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.aadhaarFrontUrl, title: "Aadhaar Card Front - " + inspectPlayer.name })}
                  className="h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.aadhaarFrontUrl} alt="Aadhaar Front" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Aadhaar Back */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Aadhaar Back</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.aadhaarBackUrl, title: "Aadhaar Card Back - " + inspectPlayer.name })}
                  className="h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.aadhaarBackUrl} alt="Aadhaar Back" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Payment Proof</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.paymentProofUrl, title: "Payment Proof Screenshot - " + inspectPlayer.name })}
                  className="h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.paymentProofUrl} alt="Payment Proof" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* UTR & Kit Info */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UTR Number</span>
                <span className="font-mono font-bold text-slate-900">{inspectPlayer.utrNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Speciality</span>
                <span className="font-bold text-slate-900">{inspectPlayer.speciality}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Uniform Kit</span>
                <span className="font-mono font-bold text-[#0041b9]">T: {inspectPlayer.tshirtSize} | P: {inspectPlayer.trackSize}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL-SCREEN IMAGE ZOOM LIGHTBOX */}
      {/* ========================================================================= */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          
          {/* Header Bar with Title and Prominent Cut (X) Button on Top Right */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-4 px-2">
            <span className="text-sm sm:text-base font-bold truncate">{fullScreenImage.title}</span>
            <button
              onClick={() => setFullScreenImage(null)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
              title="Close Image View"
            >
              <X className="w-6 h-6" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setEditPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Edit Player: {editPlayer.name}</h3>

            <form onSubmit={handleSavePlayerEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editPlayer.name}
                  onChange={(e) => setEditPlayer({ ...editPlayer, name: e.target.value })}
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
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
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
                    <option value="40">40</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">UTR / Transaction ID</label>
                <input
                  type="text"
                  value={editPlayer.utrNumber}
                  onChange={(e) => setEditPlayer({ ...editPlayer, utrNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0041b9] text-white font-bold text-xs mt-4"
              >
                Save Changes
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TEAM DETAILS & LOGO */}
      {/* ========================================================================= */}
      {editTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setEditTeam(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              {editTeam.id ? `Edit Franchise: ${editTeam.name}` : "Create New Franchise"}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Franchise Name</label>
                <input
                  type="text"
                  required
                  value={editTeam.name || ""}
                  onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    value={editTeam.shortCode || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, shortCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Established</label>
                  <input
                    type="text"
                    value={editTeam.established || "2026"}
                    onChange={(e) => setEditTeam({ ...editTeam, established: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Owner</label>
                  <input
                    type="text"
                    value={editTeam.owner || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Captain</label>
                  <input
                    type="text"
                    value={editTeam.captain || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, captain: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Logo Upload with Common Generic Icon */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">Team Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    {editTeam.logo ? (
                      <img src={editTeam.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadTeamLogo}
                    className="text-xs text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0041b9] text-white font-bold text-xs mt-4"
              >
                Save Franchise
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
