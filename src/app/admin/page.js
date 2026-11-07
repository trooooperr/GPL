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
  Loader2,
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
  ArrowUp,
  ArrowDown,
  Edit,
  Check,
  UploadCloud,
  UserX,

  Maximize2,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Menu,
  Phone,
  CreditCard,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckSquare,
  Square,
  HelpCircle
} from "lucide-react";
import QRCode from "qrcode";
import { INITIAL_RULES, INITIAL_FAQS } from "@/lib/constants";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("players"); // players | teams | sizing | settings | rules | faqs
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [settings, setSettings] = useState({
    instagramUsername: "mi_sandeep_jadhav",
    registrationFee: 0,
    maxCapacity: 140,
    adminEmail: "goregaonpremierleague11@gmail.com",
    registrationDeadline: "2026-11-28T09:00",
    registrationOpen: true
  });
  const [sizing, setSizing] = useState(null);

  const [adminQrPreview, setAdminQrPreview] = useState("");

  // Search & Filters for Players
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");

  // Bulk Selection & Export Dropdown
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchRejectModalOpen, setBatchRejectModalOpen] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Client-side canvas image compression helper for admin edits
  const compressImageToDataUrl = (file, maxWidth = 800, quality = 0.65) => {
    return new Promise((resolve) => {
      if (!file) return resolve({ name: "", dataUrl: "" });
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve({ name: file.name, dataUrl });
        };
        img.onerror = () => {
          const rawUrl = e.target.result || "";
          resolve({ name: file.name, dataUrl: rawUrl.length < 500000 ? rawUrl : "" });
        };
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ name: file.name, dataUrl: "" });
      reader.readAsDataURL(file);
    });
  };

  // Modals & Active Edit States
  const [inspectPlayer, setInspectPlayer] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [viewSquadTeam, setViewSquadTeam] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null); // { url, title }
  const [newRuleText, setNewRuleText] = useState("");
  const [editingRuleIdx, setEditingRuleIdx] = useState(null);
  const [editingRuleText, setEditingRuleText] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [editingFaqIdx, setEditingFaqIdx] = useState(null);
  const [editingFaqQ, setEditingFaqQ] = useState("");
  const [editingFaqA, setEditingFaqA] = useState("");
  const [savingFaqs, setSavingFaqs] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [key]: true } for per-button loading
  const [savingRules, setSavingRules] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [rejectPlayerModal, setRejectPlayerModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);

  // Fast parallel dashboard data loader
  const loadAllData = async () => {
    try {
      const [resPlayers, resTeams, resSettings, resRules, resFaqs, resSizing] = await Promise.all([
        fetch("/api/admin/players", { cache: "no-store" }),
        fetch("/api/admin/teams", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/rules", { cache: "no-store" }),
        fetch("/api/admin/faqs", { cache: "no-store" }),
        fetch("/api/admin/sizing", { cache: "no-store" })
      ]);

      if (resPlayers.status === 401) {
        router.push("/admin/login");
        return;
      }

      const [dataPlayers, dataTeams, dataSettings, dataRules, dataFaqs, dataSizing] = await Promise.all([
        resPlayers.json().catch(() => ({})),
        resTeams.json().catch(() => ({})),
        resSettings.json().catch(() => ({})),
        resRules.json().catch(() => ({})),
        resFaqs.json().catch(() => ({})),
        resSizing.json().catch(() => ({}))
      ]);

      if (dataPlayers.success) {
        setPlayers(dataPlayers.players || []);
        if (dataPlayers.stats) setStats(dataPlayers.stats);
      }
      if (dataTeams.success) setTeams(dataTeams.teams || []);
      if (dataSettings.success) setSettings(dataSettings.settings || {});
      if (dataRules.success && Array.isArray(dataRules.rules) && dataRules.rules.length > 0) setRules(dataRules.rules);
      if (dataFaqs.success && Array.isArray(dataFaqs.faqs) && dataFaqs.faqs.length > 0) setFaqs(dataFaqs.faqs);
      if (dataSizing.success) setSizing(dataSizing.matrix);

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
        const [resPlayers, resTeams, resSettings, resRules, resFaqs, resSizing] = await Promise.all([
          fetch("/api/admin/players", { cache: "no-store" }),
          fetch("/api/admin/teams", { cache: "no-store" }),
          fetch("/api/admin/settings", { cache: "no-store" }),
          fetch("/api/admin/rules", { cache: "no-store" }),
          fetch("/api/admin/faqs", { cache: "no-store" }),
          fetch("/api/admin/sizing", { cache: "no-store" })
        ]);

        if (resPlayers.status === 401) {
          router.push("/admin/login");
          return;
        }

        const [dataPlayers, dataTeams, dataSettings, dataRules, dataFaqs, dataSizing] = await Promise.all([
          resPlayers.json().catch(() => ({})),
          resTeams.json().catch(() => ({})),
          resSettings.json().catch(() => ({})),
          resRules.json().catch(() => ({})),
          resFaqs.json().catch(() => ({})),
          resSizing.json().catch(() => ({}))
        ]);

        if (isMounted) {
          if (dataPlayers.success) {
            setPlayers(dataPlayers.players || []);
            if (dataPlayers.stats) setStats(dataPlayers.stats);
          }
          if (dataTeams.success) setTeams(dataTeams.teams || []);
          if (dataSettings.success) setSettings(dataSettings.settings || {});
          if (dataRules.success && Array.isArray(dataRules.rules) && dataRules.rules.length > 0) setRules(dataRules.rules);
          if (dataFaqs.success && Array.isArray(dataFaqs.faqs) && dataFaqs.faqs.length > 0) setFaqs(dataFaqs.faqs);
          if (dataSizing.success) setSizing(dataSizing.matrix);
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initDashboard();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Update Dynamic QR Preview when Instagram handle changes
  useEffect(() => {
    async function genPreview() {
      try {
        const cleanHandle = (settings.instagramUsername || "mi_sandeep_jadhav").replace(/^@/, "").trim();
        const profileUrl = `https://instagram.com/${cleanHandle || "mi_sandeep_jadhav"}`;
        const dataUrl = await QRCode.toDataURL(profileUrl, {
          width: 260,
          margin: 1.5,
          color: { dark: "#081a36", light: "#ffffff" }
        });
        setAdminQrPreview(dataUrl);
      } catch (e) {}
    }
    genPreview();
  }, [settings.instagramUsername]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3500);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // --- PLAYER ACTIONS (INSTANT OPTIMISTIC FEEDBACK) ---
  const handleUpdateStatus = async (playerId, newStatus, notes = "") => {
    const prevPlayers = players;
    const prevStats = stats;
    const prevTeams = teams;
    const targetPlayer = players.find((p) => p.id === playerId);
    const oldStatus = targetPlayer?.paymentStatus || "Pending";

    // 1. OPTIMISTIC UPDATE: Instant UI response in 0ms
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              paymentStatus: newStatus,
              ...(newStatus === "Rejected" ? { teamId: null, notes } : { notes: notes || p.notes })
            }
          : p
      )
    );

    // If rejected, remove from any assigned team members locally
    if (newStatus === "Rejected") {
      setTeams((prev) =>
        prev.map((t) => ({
          ...t,
          members: (t.members || []).filter((mid) => mid !== playerId)
        }))
      );
    }

    // Instantly update stats counters
    setStats((prev) => {
      if (!prev || oldStatus === newStatus) return prev;
      const s = { ...prev };
      if (oldStatus === "Pending") s.pending = Math.max(0, (s.pending || 0) - 1);
      if (oldStatus === "Approved") s.approved = Math.max(0, (s.approved || 0) - 1);
      if (oldStatus === "Rejected") s.rejected = Math.max(0, (s.rejected || 0) - 1);

      if (newStatus === "Approved") s.approved = (s.approved || 0) + 1;
      if (newStatus === "Rejected") s.rejected = (s.rejected || 0) + 1;
      if (newStatus === "Pending") s.pending = (s.pending || 0) + 1;

      s.available = Math.max(0, (s.maxCapacity || 154) - s.approved);
      s.remainingSlots = s.available;
      return s;
    });

    if (inspectPlayer && inspectPlayer.id === playerId) {
      if (newStatus === "Rejected") {
        setInspectPlayer(null);
      } else {
        setInspectPlayer((prev) => (prev ? { ...prev, paymentStatus: newStatus } : null));
      }
    }

    showToast(
      `Marked as ${newStatus}!${newStatus === "Rejected" ? " Rejection notice queued." : ""}`,
      "success"
    );

    // 2. Perform DB update in background (lightweight & fast)
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, status: newStatus, notes }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback state on error
        setPlayers(prevPlayers);
        setStats(prevStats);
        setTeams(prevTeams);
        showToast(data.error || "Failed to update status on server", "error");
      } else if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setStats(prevStats);
      setTeams(prevTeams);
      showToast("Failed to update status: " + err.message, "error");
    }
  };

  const promptRejectPlayer = (player) => {
    setRejectPlayerModal(player);
    setRejectReason("Aadhaar card address not from Ward 51 or 54 (Goregaon East)");
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!rejectPlayerModal) return;
    const modalPlayer = rejectPlayerModal;
    const reason = rejectReason;
    setIsRejecting(false);
    setRejectPlayerModal(null);
    setRejectReason("");
    await handleUpdateStatus(modalPlayer.id, "Rejected", reason);
  };

  const handleSavePlayerEdit = async (e) => {
    e.preventDefault();
    setIsSavingPlayer(true);
    const prevPlayers = players;
    const prevInspect = inspectPlayer;

    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) => (p.id === editPlayer.id ? { ...p, ...editPlayer } : p))
    );
    if (inspectPlayer && inspectPlayer.id === editPlayer.id) {
      setInspectPlayer((prev) => ({ ...prev, ...editPlayer }));
    }
    const targetPlayer = editPlayer;
    setEditPlayer(null);
    showToast("Player details updated!", "success");

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          id: targetPlayer.id,
          playerData: targetPlayer
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPlayers(prevPlayers);
        setInspectPlayer(prevInspect);
        showToast(data.error || "Failed to save player details", "error");
      } else {
        if (data.player) {
          setPlayers((prev) =>
            prev.map((p) => (p.id === data.player.id ? data.player : p))
          );
          if (inspectPlayer && inspectPlayer.id === data.player.id) {
            setInspectPlayer(data.player);
          }
        }
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setInspectPlayer(prevInspect);
      showToast("Failed to update player: " + err.message, "error");
    } finally {
      setIsSavingPlayer(false);
    }
  };

  const handleDeletePlayer = (playerId) => {
    setConfirmModal({
      title: "Delete Player Registration",
      message: "Are you sure you want to permanently delete this registration? All submitted documents will be removed.",
      confirmText: "Yes, Delete Player",
      onConfirm: async () => {
        const prevPlayers = players;
        const prevStats = stats;

        // Optimistic delete
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        if (inspectPlayer && inspectPlayer.id === playerId) setInspectPlayer(null);
        showToast("Player registration deleted!", "success");

        try {
          const res = await fetch("/api/admin/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id: playerId }),
          });
          const data = await res.json();
          if (!data.success) {
            setPlayers(prevPlayers);
            setStats(prevStats);
            showToast(data.error || "Failed to delete player", "error");
          } else if (data.stats) {
            setStats(data.stats);
          }
        } catch (err) {
          setPlayers(prevPlayers);
          setStats(prevStats);
          showToast("Failed to delete player: " + err.message, "error");
        }
      }
    });
  };

  // --- TEAM ASSIGNMENT (ZERO DELAY OPTIMISTIC FEEDBACK) ---
  const handleAssignTeam = async (playerId, teamId) => {
    const cleanTeamId = teamId && teamId !== "unassign" && teamId !== "" ? teamId : null;
    const targetPlayer = players.find((p) => p.id === playerId);

    if (cleanTeamId && targetPlayer && targetPlayer.paymentStatus === "Rejected") {
      showToast("Cannot assign a rejected player to a team. Approve the player first.", "error");
      return;
    }

    const prevPlayers = players;
    const prevTeams = teams;

    // 1. OPTIMISTIC UPDATE: Instant dropdown change and squad count update
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, teamId: cleanTeamId } : p))
    );

    setTeams((prev) =>
      prev.map((t) => {
        const withoutPlayer = (t.members || []).filter((mid) => mid !== playerId);
        if (cleanTeamId && t.id === cleanTeamId) {
          return { ...t, members: [...withoutPlayer, playerId] };
        }
        return { ...t, members: withoutPlayer };
      })
    );

    const teamObj = teams.find((t) => t.id === cleanTeamId);
    showToast(
      cleanTeamId ? `Assigned to ${teamObj?.name || "team"}!` : "Player unassigned from team.",
      "success"
    );

    // 2. Perform background DB update without blocking UI
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", playerId, teamId: cleanTeamId }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on server rejection (e.g. squad full)
        setPlayers(prevPlayers);
        setTeams(prevTeams);
        showToast(data.error || "Failed to assign team", "error");
      } else if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setTeams(prevTeams);
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
        setSettingsMsg("Settings & Official Instagram configuration updated successfully!");
        setTimeout(() => setSettingsMsg(""), 3000);
      }
    } catch (err) {
      showToast("Failed to save settings: " + err.message, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // --- ABOUT PHOTOS MANAGEMENT ---
  const handleReplacePhoto = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { dataUrl } = await compressImageToDataUrl(file, 1200, 0.80);
    if (!dataUrl) return;
    const newPhotos = [...(settings.aboutPhotos || [])];
    newPhotos[idx] = dataUrl;
    setSettings({ ...settings, aboutPhotos: newPhotos });
  };
  const handleNewPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { dataUrl } = await compressImageToDataUrl(file, 1200, 0.80);
    if (!dataUrl) return;
    setSettings({ ...settings, aboutPhotos: [...(settings.aboutPhotos || []), dataUrl] });
  };
  const handleRemovePhoto = (idx) => {
    const newPhotos = (settings.aboutPhotos || []).filter((_, i) => i !== idx);
    setSettings({ ...settings, aboutPhotos: newPhotos });
  };

  // --- TEAM SAVE & LOGO UPLOAD ---
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setSavingTeam(true);
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
      } else {
        showToast("Failed to save team: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Failed to save team: " + err.message, "error");
    } finally {
      setSavingTeam(false);
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
            setPlayers(prev => prev.map(p => p.teamId === teamId ? { ...p, teamId: null } : p));
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
    setSavingRules(true);
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
        showToast("Rule added successfully!", "success");
      } else {
        showToast("Failed to add rule: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Failed to add rule: " + err.message, "error");
    } finally {
      setSavingRules(false);
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

  const handleStartEditRule = (idx, text) => {
    setEditingRuleIdx(idx);
    setEditingRuleText(text);
  };

  const handleCancelEditRule = () => {
    setEditingRuleIdx(null);
    setEditingRuleText("");
  };

  const handleSaveEditRule = async (idx) => {
    if (!editingRuleText.trim()) return;
    const updated = [...rules];
    updated[idx] = editingRuleText.trim();
    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
        setEditingRuleIdx(null);
        setEditingRuleText("");
        showToast("Rule updated successfully!", "success");
      }
    } catch (err) {
      showToast("Failed to update rule: " + err.message, "error");
    }
  };

  const handleMoveRule = async (idx, direction) => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= rules.length) return;
    const updated = [...rules];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    try {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      showToast("Failed to move rule: " + err.message, "error");
    }
  };

  // --- FAQS MANAGER ---
  const handleAddFaq = async () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      showToast("Please enter both question and answer", "error");
      return;
    }
    setSavingFaqs(true);
    const updated = [...faqs, { q: newFaqQ.trim(), a: newFaqA.trim() }];
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
        setNewFaqQ("");
        setNewFaqA("");
        showToast("FAQ added successfully!", "success");
      } else {
        showToast("Failed to add FAQ: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Failed to add FAQ: " + err.message, "error");
    } finally {
      setSavingFaqs(false);
    }
  };

  const handleDeleteFaq = async (idx) => {
    const updated = faqs.filter((_, i) => i !== idx);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
        showToast("FAQ deleted", "success");
      } else {
        showToast("Failed to delete FAQ: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Failed to delete FAQ: " + err.message, "error");
    }
  };

  const handleStartEditFaq = (idx, faq) => {
    setEditingFaqIdx(idx);
    setEditingFaqQ(faq.q);
    setEditingFaqA(faq.a);
  };

  const handleCancelEditFaq = () => {
    setEditingFaqIdx(null);
    setEditingFaqQ("");
    setEditingFaqA("");
  };

  const handleSaveEditFaq = async (idx) => {
    if (!editingFaqQ.trim() || !editingFaqA.trim()) {
      showToast("Both question and answer are required", "error");
      return;
    }
    const updated = [...faqs];
    updated[idx] = { q: editingFaqQ.trim(), a: editingFaqA.trim() };
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
        setEditingFaqIdx(null);
        setEditingFaqQ("");
        setEditingFaqA("");
        showToast("FAQ updated successfully!", "success");
      } else {
        showToast("Failed to update FAQ: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Failed to update FAQ: " + err.message, "error");
    }
  };

  const handleMoveFaq = async (idx, direction) => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;
    const updated = [...faqs];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (err) {
      showToast("Failed to move FAQ: " + err.message, "error");
    }
  };

  // Filtered Players with role, team, and registration number search
  const filteredPlayers = players.filter((p) => {
    const matchesQuery =
      searchQuery === "" ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.regNumber || "").includes(searchQuery) ||
      p.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || p.paymentStatus === statusFilter;

    const matchesWard =
      wardFilter === "ALL" || p.ward === wardFilter;

    const matchesRole =
      roleFilter === "ALL" ||
      p.speciality?.toLowerCase().includes(roleFilter.toLowerCase());

    const matchesTeam =
      teamFilter === "ALL"
        ? true
        : teamFilter === "UNASSIGNED"
        ? !p.teamId
        : teamFilter === "ASSIGNED"
        ? !!p.teamId
        : p.teamId === teamFilter;

    return matchesQuery && matchesStatus && matchesWard && matchesRole && matchesTeam;
  });

  // Bulk Selection Handlers
  const allFilteredSelected =
    filteredPlayers.length > 0 &&
    filteredPlayers.every((p) => selectedIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlayers.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    const idsToApprove = [...selectedIds];
    const prevPlayers = players;
    const prevStats = stats;

    setPlayers((prev) =>
      prev.map((p) => (idsToApprove.includes(p.id) ? { ...p, paymentStatus: "Approved" } : p))
    );
    setSelectedIds([]);
    showToast(`${idsToApprove.length} players marked as Approved!`, "success");

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batchStatus", ids: idsToApprove, status: "Approved" }),
      });
      const data = await res.json();
      if (!data.success) {
        setPlayers(prevPlayers);
        setStats(prevStats);
        showToast(data.error || "Batch approval failed", "error");
      } else if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setStats(prevStats);
      showToast("Network error: " + err.message, "error");
    }
  };

  const handleConfirmBatchReject = async () => {
    if (selectedIds.length === 0) return;
    const idsToReject = [...selectedIds];
    const reason = batchRejectReason || "Aadhaar address not from Ward 51/54 (Goregaon East)";
    const prevPlayers = players;
    const prevStats = stats;
    const prevTeams = teams;

    setPlayers((prev) =>
      prev.map((p) =>
        idsToReject.includes(p.id)
          ? { ...p, paymentStatus: "Rejected", teamId: null, notes: reason }
          : p
      )
    );
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        members: (t.members || []).filter((mid) => !idsToReject.includes(mid))
      }))
    );
    setSelectedIds([]);
    setBatchRejectModalOpen(false);
    setBatchRejectReason("");
    showToast(`${idsToReject.length} players marked as Rejected!`, "success");

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batchStatus",
          ids: idsToReject,
          status: "Rejected",
          notes: reason
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPlayers(prevPlayers);
        setStats(prevStats);
        setTeams(prevTeams);
        showToast(data.error || "Batch rejection failed", "error");
      } else if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setStats(prevStats);
      setTeams(prevTeams);
      showToast("Network error: " + err.message, "error");
    }
  };

  const handleBatchAssignTeam = async (teamId) => {
    if (selectedIds.length === 0) return;
    const cleanTeamId = teamId && teamId !== "unassign" && teamId !== "" ? teamId : null;

    // Filter out rejected players when assigning to a team
    const rejectedCount = players.filter(
      (p) => selectedIds.includes(p.id) && p.paymentStatus === "Rejected"
    ).length;
    const eligiblePlayers = cleanTeamId
      ? players.filter((p) => selectedIds.includes(p.id) && p.paymentStatus !== "Rejected")
      : players.filter((p) => selectedIds.includes(p.id));

    if (cleanTeamId && eligiblePlayers.length === 0) {
      showToast("Selected players are all rejected and cannot be assigned to any team.", "error");
      return;
    }

    const idsToAssign = eligiblePlayers.map((p) => p.id);
    const prevPlayers = players;
    const prevTeams = teams;

    setPlayers((prev) =>
      prev.map((p) => (idsToAssign.includes(p.id) ? { ...p, teamId: cleanTeamId } : p))
    );
    setTeams((prev) =>
      prev.map((t) => {
        const without = (t.members || []).filter((mid) => !idsToAssign.includes(mid));
        if (cleanTeamId && t.id === cleanTeamId) {
          return { ...t, members: [...without, ...idsToAssign].slice(0, 14) };
        }
        return { ...t, members: without };
      })
    );
    setSelectedIds([]);
    const targetTeam = teams.find((t) => t.id === cleanTeamId);
    showToast(
      cleanTeamId
        ? `${idsToAssign.length} players assigned to ${targetTeam?.name || "team"}!${rejectedCount > 0 ? ` (${rejectedCount} rejected players skipped)` : ""}`
        : `${idsToAssign.length} players unassigned from teams.`,
      "success"
    );

    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batchAssign", playerIds: idsToAssign, teamId: cleanTeamId }),
      });
      const data = await res.json();
      if (!data.success) {
        setPlayers(prevPlayers);
        setTeams(prevTeams);
        showToast(data.error || "Batch team assignment failed", "error");
      } else if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      setPlayers(prevPlayers);
      setTeams(prevTeams);
      showToast("Network error: " + err.message, "error");
    }
  };

  // Inspect Player Keyboard & Arrow Navigation
  const currentInspectIdx = inspectPlayer
    ? filteredPlayers.findIndex((p) => p.id === inspectPlayer.id)
    : -1;

  const handlePrevInspectPlayer = () => {
    if (currentInspectIdx > 0) {
      setInspectPlayer(filteredPlayers[currentInspectIdx - 1]);
    }
  };

  const handleNextInspectPlayer = () => {
    if (currentInspectIdx >= 0 && currentInspectIdx < filteredPlayers.length - 1) {
      setInspectPlayer(filteredPlayers[currentInspectIdx + 1]);
    }
  };

  useEffect(() => {
    if (!inspectPlayer) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setInspectPlayer(null);
      } else if (e.key === "ArrowRight") {
        if (currentInspectIdx >= 0 && currentInspectIdx < filteredPlayers.length - 1) {
          setInspectPlayer(filteredPlayers[currentInspectIdx + 1]);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentInspectIdx > 0) {
          setInspectPlayer(filteredPlayers[currentInspectIdx - 1]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectPlayer, currentInspectIdx, filteredPlayers]);

  const tabItems = [
    { id: "players", label: `Players (${players.length})`, icon: Users },
    { id: "teams", label: `Teams (${teams.length})`, icon: Trophy },
    { id: "sizing", label: "Kit Sizing", icon: Shirt },
    { id: "settings", label: "Instagram & Settings", icon: InstagramIcon },
    { id: "rules", label: "Rules", icon: FileText },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
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
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center drop-shadow-md">
              <img
                src="/images/gpl-logo.png"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0041b9] hover:bg-[#003399] text-white text-xs font-semibold shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
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
              className="p-2 rounded-lg bg-[#0041b9] text-white text-xs cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
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
            
            <div
              onClick={() => { setActiveTab("players"); setStatusFilter("ALL"); setRoleFilter("ALL"); setTeamFilter("ALL"); }}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to view All Players"
            >
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

            <div
              onClick={() => { setActiveTab("players"); setStatusFilter("Approved"); }}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-200/80 shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to filter Approved Players"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Approved
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-emerald-700">
                {stats.approved}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Auction eligible ⚡</span>
            </div>

            <div
              onClick={() => { setActiveTab("players"); setStatusFilter("Pending"); }}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200/80 shadow-xs cursor-pointer hover:border-amber-500 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to filter Pending Players"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Pending Review
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-amber-700">
                {stats.pending}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Needs verification 🔍</span>
            </div>

            <div
              onClick={() => { setActiveTab("players"); setStatusFilter("Rejected"); }}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-red-200/80 shadow-xs cursor-pointer hover:border-red-500 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to filter Rejected Players"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Rejected
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-red-700">
                {stats.rejected}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Non-eligible</span>
            </div>

            <div
              onClick={() => setActiveTab("teams")}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to view Franchises & Teams"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Franchises
              </span>
              <span className="text-xl sm:text-3xl font-extrabold text-[#081a36]">
                {teams.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">Teams active 🏆</span>
            </div>

            <div
              onClick={() => setActiveTab("settings")}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-pink-200/80 shadow-xs cursor-pointer hover:border-pink-500 hover:shadow-md transition-all active:scale-[0.98]"
              title="Click to view Instagram & Settings"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-pink-600 uppercase tracking-wider block mb-0.5 sm:mb-1">
                Registration Mode
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-pink-700">
                100% FREE
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 sm:mt-1 truncate">
                IG: @{(settings.instagramUsername || "mi_sandeep_jadhav").replace(/^@/, '')}
              </span>
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

              <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 w-full sm:w-auto">
                {/* Status Filter */}
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

                {/* Ward Filter */}
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

                {/* Role / Speciality Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="batsman">Batsmen</option>
                  <option value="bowler">Bowlers</option>
                  <option value="all-rounder">All-Rounders</option>
                  <option value="Wicketkeeper">Wicketkeepers</option>
                </select>

                {/* Team Assignment Filter */}
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Teams</option>
                  <option value="UNASSIGNED">Unassigned (Auction Pool)</option>
                  <option value="ASSIGNED">Assigned to Any Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportMenuOpen((prev) => !prev)}
                    className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#0041b9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export ▾</span>
                  </button>
                  {exportMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs space-y-0.5"
                      onClick={() => setExportMenuOpen(false)}
                    >
                      <a
                        href="/api/admin/export?filter=all"
                        className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        📄 Export All Registrations (CSV)
                      </a>
                      <a
                        href="/api/admin/export?filter=approved"
                        className="block px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 font-semibold"
                      >
                        ⚡ Export Auction Pool (Approved)
                      </a>
                      <a
                        href="/api/admin/export?filter=sizing"
                        className="block px-3.5 py-2 text-purple-700 hover:bg-purple-50 font-semibold"
                      >
                        👕 Export Kit Sizing Sheet
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={loadAllData}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
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
                filteredPlayers.map((player, idx) => (
                  <div
                    key={player.id || idx}
                    className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    {/* Top Row: Checkbox, Name, Reg ID & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(player.id)}
                          onChange={() => handleToggleSelect(player.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">{player.name}</h3>
                          <span className="text-xs font-mono font-bold text-blue-600 block mt-0.5">
                            #{player.regNumber || (player.id ? player.id.replace(/\D/g, "") : "")}
                          </span>
                        </div>
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
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Instagram / Ref</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] block break-all leading-tight">
                          {player.instagramHandle ? `@${player.instagramHandle.replace(/^@/, '')}` : (player.utrNumber || "FREE-REG")}
                        </span>
                      </div>
                    </div>

                    {/* Documents Lightbox Row (3 columns, guaranteed 0 horizontal overflow) */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.aadhaarFrontUrl, title: `Aadhaar Front - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-blue-50 text-[#0041b9] text-[11px] font-semibold border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors min-w-0 cursor-pointer"
                      >
                        <FileCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Aadhaar F</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.aadhaarBackUrl, title: `Aadhaar Back - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-blue-50 text-[#0041b9] text-[11px] font-semibold border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors min-w-0 cursor-pointer"
                      >
                        <FileCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Aadhaar B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFullScreenImage({ url: player.paymentProofUrl, title: `Instagram Follow Proof - ${player.name}` })}
                        className="py-1.5 px-1 rounded-lg bg-pink-50 text-pink-700 text-[11px] font-semibold border border-pink-100 hover:bg-pink-100 flex items-center justify-center gap-1 transition-colors min-w-0"
                      >
                        <InstagramIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">IG Proof</span>
                      </button>
                    </div>

                    {/* Team Selector */}
                    <div>
                      {player.paymentStatus === "Rejected" ? (
                        <div className="w-full px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-between">
                          <span>Cannot Assign</span>
                          <span className="text-[10px] font-bold uppercase bg-red-200/60 px-1.5 py-0.5 rounded">Rejected</span>
                        </div>
                      ) : (
                        <select
                          value={player.teamId || ""}
                          onChange={(e) => handleAssignTeam(player.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                        >
                          <option value="">— Unassigned (Auction Pool) —</option>
                          {teams.map((t, tIdx) => (
                            <option key={t.id || tIdx} value={t.id}>
                              {t.name} ({t.shortCode})
                            </option>
                          ))}
                        </select>
                      )}
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
                          onClick={() => promptRejectPlayer(player)}
                          className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100 cursor-pointer"
                        title="Inspect Player"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
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
                      <th className="py-4 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          title={allFilteredSelected ? "Deselect All" : "Select All"}
                        />
                      </th>
                      <th className="py-4 px-4">Player</th>
                      <th className="py-4 px-4">Role &amp; Ward</th>
                      <th className="py-4 px-4">Kit Size</th>
                      <th className="py-4 px-4">Instagram / Ref</th>
                      <th className="py-4 px-4">Documents</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Assigned Team</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => {
                        const isSelected = selectedIds.includes(player.id);
                        return (
                          <tr key={player.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                            <td className="py-4 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(player.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0041b9] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-blue-200">
                                  {player.photoUrl && !player.photoUrl.includes('placeholder') ? (
                                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                  ) : (
                                    player.name[0]
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{player.name}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span className="font-mono text-blue-600 font-bold">#{player.regNumber || (player.id ? player.id.replace(/\D/g, "") : "")}</span>
                                    <span>•</span>
                                    <a href={`tel:${player.phone}`} className="hover:underline">{player.phone}</a>
                                  </div>
                                </div>
                              </div>
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
                              <div className="font-mono text-xs font-semibold text-slate-800">
                                {player.instagramHandle ? `@${player.instagramHandle.replace(/^@/, '')}` : (player.utrNumber || "FREE-REG")}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1.5">
                                {player.photoUrl && !player.photoUrl.includes('placeholder') && (
                                  <button
                                    onClick={() => setFullScreenImage({ url: player.photoUrl, title: `Profile Photo - ${player.name}` })}
                                    className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-mono text-[10px] px-1.5 cursor-pointer"
                                    title="Profile Photo"
                                  >
                                    Ph
                                  </button>
                                )}
                                <button
                                  onClick={() => setFullScreenImage({ url: player.aadhaarFrontUrl, title: `Aadhaar Front - ${player.name}` })}
                                  className="p-1 rounded bg-blue-50 text-[#0041b9] hover:bg-blue-100 font-mono text-[10px] px-1.5 cursor-pointer"
                                  title="Aadhaar Front"
                                >
                                  AF
                                </button>
                                <button
                                  onClick={() => setFullScreenImage({ url: player.aadhaarBackUrl, title: `Aadhaar Back - ${player.name}` })}
                                  className="p-1 rounded bg-blue-50 text-[#0041b9] hover:bg-blue-100 font-mono text-[10px] px-1.5 cursor-pointer"
                                  title="Aadhaar Back"
                                >
                                  AB
                                </button>
                                <button
                                  onClick={() => setFullScreenImage({ url: player.paymentProofUrl, title: `Instagram Follow Proof - ${player.name}` })}
                                  className="p-1 rounded bg-pink-50 text-pink-700 hover:bg-pink-100 font-mono text-[10px] px-1.5"
                                  title="Instagram Follow Proof"
                                >
                                  IG
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
                              {player.paymentStatus === "Rejected" ? (
                                <div
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold"
                                  title="Rejected players cannot be assigned to any team"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span>Cannot Assign (Rejected)</span>
                                </div>
                              ) : (
                                <select
                                  value={player.teamId || ""}
                                  onChange={(e) => handleAssignTeam(player.id, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                                >
                                  <option value="">— Unassigned —</option>
                                  {teams.map((t, tIdx) => (
                                    <option key={t.id || tIdx} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              )}
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
                                    onClick={() => promptRejectPlayer(player)}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                                    title="Reject Player"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setInspectPlayer(player)}
                                  className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100 cursor-pointer"
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
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
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
                        <td colSpan={9} className="py-12 text-center text-slate-400">
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
                onClick={() => setEditTeam({ name: "", shortCode: "", owner: "", captain: "", logo: "", themeColor: "#0041b9" })}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0041b9] hover:bg-[#003399] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between relative overflow-hidden"
                    style={{ borderTop: `4px solid ${team.themeColor || "#0041b9"}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
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
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{team.name}</h3>
                          <span className="text-xs font-mono font-bold text-[#0041b9]">Code: {team.shortCode}</span>
                        </div>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: team.themeColor || "#0041b9" }}
                        title={`Theme Color: ${team.themeColor || "#0041b9"}`}
                      />
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

                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setViewSquadTeam(team)}
                        className="flex-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0041b9] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
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
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0041b9] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
        {/* TAB 4: INSTAGRAM & TOURNAMENT SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                  <InstagramIcon className="w-4 h-4" />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Instagram Page &amp; Tournament Settings</h2>
              </div>
              <p className="text-xs text-slate-500">
                Updating the official Instagram handle below automatically updates the dynamic scan-to-follow QR code across the website and registration flow.
              </p>
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
                  Official GPL Instagram Page Username / Handle
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="mi_sandeep_jadhav"
                    value={(settings.instagramUsername || "").replace(/^@/, '')}
                    onChange={(e) => setSettings({ ...settings, instagramUsername: e.target.value.replace(/^@/, '').trim() })}
                    className="w-full pl-8 pr-28 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-[#0041b9] outline-none"
                  />
                  <a
                    href={`https://instagram.com/${(settings.instagramUsername || "mi_sandeep_jadhav").replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Players are required to follow this handle and submit a screenshot proving they follow the page.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Deadline / Countdown Target Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={settings.registrationDeadline || "2026-11-28T09:00"}
                  onChange={(e) => setSettings({ ...settings, registrationDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans focus:ring-2 focus:ring-[#0041b9] outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Controls the live countdown timer on the homepage (Days, Hours, Minutes, Seconds remaining for registration).
                </p>
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

              {/* About Section Photos Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">About Section Photos</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById("add-about-photo-input").click()}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#0041b9]/10 text-[#0041b9] hover:bg-[#0041b9]/20 font-semibold transition-colors"
                  >
                    + Add Photo
                  </button>
                </div>
                <input
                  type="file"
                  id="add-about-photo-input"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleNewPhotoUpload}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(settings.aboutPhotos || ["/images/gpl-card-1.jpg", "/images/gpl-card-2.jpg"]).map((photo, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[9/16]">
                      <img src={photo} alt={`About ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer p-1.5 rounded-lg bg-white/90 text-slate-800 text-[10px] font-bold hover:bg-white">
                          Replace
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleReplacePhoto(idx, e)} />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Hover over a photo to replace or remove it. Click &quot;+ Add Photo&quot; to upload a new one. Changes save when you click &quot;Save Tournament Settings&quot;.
                </p>
              </div>

              {/* Dynamic QR Live Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-32 bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {adminQrPreview ? (
                    <img src={adminQrPreview} alt="Live Instagram QR Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Generating...</span>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <InstagramIcon className="w-3 h-3" />
                    <span>Dynamic Live Preview</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Official Instagram Follow QR Code</h4>
                  <p className="text-[11px] text-slate-500">
                    This QR code automatically encodes <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-slate-800">https://instagram.com/{(settings.instagramUsername || "mi_sandeep_jadhav").replace(/^@/, '')}</code>. Players scan it to follow your profile before uploading screenshot proof.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 rounded-xl bg-[#0041b9] hover:bg-[#003399] disabled:bg-slate-400 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
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
                  {editingRuleIdx === idx ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingRuleText}
                        onChange={(e) => setEditingRuleText(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-blue-400 bg-white text-slate-800 text-xs focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEditRule(idx)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        title="Save Rule"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEditRule}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5 flex-1 pr-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0041b9] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 leading-relaxed font-medium">{rule}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveRule(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveRule(idx, "down")}
                          disabled={idx === rules.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartEditRule(idx, rule)}
                          className="p-1 text-slate-400 hover:text-[#0041b9] rounded cursor-pointer"
                          title="Edit Rule"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
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
        {/* TAB 6: FREQUENTLY ASKED QUESTIONS (FAQS) */}
        {/* ========================================================================= */}
        {activeTab === "faqs" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#081a36]">Frequently Asked Questions (FAQs)</h2>
                <p className="text-xs text-slate-500">Live Q&amp;A accordion displayed to prospective players on the public portal</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#059669] font-bold text-xs border border-emerald-200 shrink-0">
                {faqs.length} FAQs
              </span>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs transition-all"
                >
                  {editingFaqIdx === idx ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Question</label>
                        <input
                          type="text"
                          value={editingFaqQ}
                          onChange={(e) => setEditingFaqQ(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-blue-400 bg-white text-slate-800 text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Answer</label>
                        <textarea
                          rows={3}
                          value={editingFaqA}
                          onChange={(e) => setEditingFaqA(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-blue-400 bg-white text-slate-800 text-xs focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEditFaq}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditFaq(idx)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 pr-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <span className="text-slate-900 font-bold text-xs sm:text-sm leading-snug">
                            {faq.q}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveFaq(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveFaq(idx, "down")}
                            disabled={idx === faqs.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEditFaq(idx, faq)}
                            className="p-1.5 text-slate-400 hover:text-[#0041b9] rounded cursor-pointer transition-colors"
                            title="Edit FAQ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 pl-7 text-slate-600 leading-relaxed font-normal text-xs bg-white/70 p-2.5 rounded-lg border border-slate-100">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add FAQ Form */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Add New Question &amp; Answer</label>
              <input
                type="text"
                placeholder="Question (e.g. Can players from outside Ward 51 or 54 participate?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#059669] outline-none bg-slate-50 focus:bg-white transition-all"
              />
              <textarea
                rows={3}
                placeholder="Answer (e.g. No, participation is strictly reserved for residents of Ward 51 and 54)..."
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#059669] outline-none resize-none leading-relaxed bg-slate-50 focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddFaq}
                  disabled={!newFaqQ.trim() || !newFaqA.trim() || savingFaqs}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingFaqs ? "Saving FAQ..." : "Add FAQ"}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: INSPECT PLAYER FULL DETAILS */}
      {/* ========================================================================= */}
      {inspectPlayer && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 animate-scaleUp">
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevInspectPlayer}
                  disabled={currentInspectIdx <= 0}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Player (← Arrow Left)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {currentInspectIdx >= 0 ? `${currentInspectIdx + 1} / ${filteredPlayers.length}` : ""}
                </span>
                <button
                  type="button"
                  onClick={handleNextInspectPlayer}
                  disabled={currentInspectIdx >= filteredPlayers.length - 1}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Player (→ Arrow Right)"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${inspectPlayer.phone}`}
                  className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold inline-flex items-center gap-1 border border-blue-200"
                  title="Call Player"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <button
                  type="button"
                  onClick={() => { const p = inspectPlayer; setInspectPlayer(null); setEditPlayer(p); }}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                  title="Edit Player Details"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setInspectPlayer(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 ml-1"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-blue-100 text-[#0041b9] flex items-center justify-center font-bold text-lg overflow-hidden cursor-pointer border-2 border-blue-200 shrink-0"
                onClick={() => inspectPlayer.photoUrl && !inspectPlayer.photoUrl.includes('placeholder') && setFullScreenImage({ url: inspectPlayer.photoUrl, title: `Profile Photo - ${inspectPlayer.name}` })}
              >
                {inspectPlayer.photoUrl && !inspectPlayer.photoUrl.includes('placeholder') ? (
                  <img src={inspectPlayer.photoUrl} alt={inspectPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  inspectPlayer.name[0]
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{inspectPlayer.name}</h3>
                <span className="text-xs font-mono text-slate-400">
                  ID: #{inspectPlayer.regNumber || inspectPlayer.id} • {inspectPlayer.phone}
                </span>
              </div>
            </div>

            {/* Document Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {/* Profile Photo (only if provided) */}
              {inspectPlayer.photoUrl && !inspectPlayer.photoUrl.includes('placeholder') && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Profile Photo</span>
                  <div
                    onClick={() => setFullScreenImage({ url: inspectPlayer.photoUrl, title: `Profile Photo - ${inspectPlayer.name}` })}
                    className="h-32 sm:h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                  >
                    <img src={inspectPlayer.photoUrl} alt="Profile" className="max-h-full max-w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

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

              {/* Instagram Follow Proof */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Instagram Follow Proof</span>
                <div
                  onClick={() => setFullScreenImage({ url: inspectPlayer.paymentProofUrl, title: `Instagram Follow Proof - ${inspectPlayer.name}` })}
                  className="h-32 sm:h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group relative hover:border-[#0041b9]"
                >
                  <img src={inspectPlayer.paymentProofUrl} alt="Instagram Follow Proof" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Instagram / Ref</span>
                <span className="font-mono font-bold text-slate-900 truncate block">
                  {inspectPlayer.instagramHandle ? `@${inspectPlayer.instagramHandle.replace(/^@/, '')}` : (inspectPlayer.utrNumber || "FREE-REG")}
                </span>
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
                onClick={() => { promptRejectPlayer(inspectPlayer); setInspectPlayer(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4">
          
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
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setEditPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">Edit Player: {editPlayer.name}</h3>

            <form onSubmit={handleSavePlayerEdit} className="space-y-3 text-xs">
              {/* Profile Photo Editor */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0041b9] flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-blue-200 shrink-0 shadow-xs">
                  {editPlayer.photoUrl && !editPlayer.photoUrl.includes("placeholder") ? (
                    <img src={editPlayer.photoUrl} alt={editPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    editPlayer.name?.[0] || "P"
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-700 block text-xs">Profile Photo</span>
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-[#0041b9] cursor-pointer text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs">
                      <UploadCloud className="w-3 h-3 text-[#0041b9]" />
                      <span>{editPlayer.photoUrl && !editPlayer.photoUrl.includes("placeholder") ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const res = await compressImageToDataUrl(file);
                            if (res.dataUrl) {
                              setEditPlayer((prev) => ({ ...prev, photoUrl: res.dataUrl }));
                              showToast("Profile photo selected! Click 'Save Changes' to apply.", "success");
                            }
                          }
                        }}
                      />
                    </label>
                    {editPlayer.photoUrl && !editPlayer.photoUrl.includes("placeholder") && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditPlayer((prev) => ({ ...prev, photoUrl: "" }));
                          showToast("Photo removed. Click 'Save Changes' to apply.", "info");
                        }}
                        className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
                <label className="font-bold text-slate-700 block mb-1">Instagram Username / Follow Ref</label>
                <input
                  type="text"
                  value={editPlayer.instagramHandle || editPlayer.utrNumber || ""}
                  onChange={(e) => setEditPlayer({ ...editPlayer, instagramHandle: e.target.value, utrNumber: e.target.value })}
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
                  disabled={isSavingPlayer}
                  className="flex-1 py-2 rounded-lg bg-[#0041b9] hover:bg-[#003399] disabled:bg-[#0041b9]/70 text-white font-bold cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isSavingPlayer ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
                  ) : (
                    <span>Save Changes</span>
                  )}
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
                  <label className="font-bold text-slate-700 block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    minLength={2}
                    placeholder="CSK"
                    value={editTeam.shortCode || ""}
                    onChange={(e) => setEditTeam({ ...editTeam, shortCode: e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3) })}
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

              {/* Theme Color Customization */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 text-xs">Franchise Theme Color</label>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: editTeam.themeColor || "#0041b9", color: editTeam.themeColor || "#0041b9" }}>
                    {editTeam.themeColor || "#0041b9"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editTeam.themeColor || "#0041b9"}
                    onChange={(e) => setEditTeam({ ...editTeam, themeColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                    title="Click to choose custom hex color"
                  />
                  <input
                    type="text"
                    value={editTeam.themeColor || "#0041b9"}
                    onChange={(e) => setEditTeam({ ...editTeam, themeColor: e.target.value })}
                    placeholder="#0041b9"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-semibold"
                  />
                </div>

                {/* Popular Franchise Palette Presets */}
                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">Preset Themes:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Gold / CSK", color: "#eab308" },
                      { name: "Purple / KKR", color: "#7e22ce" },
                      { name: "Teal / GT", color: "#0d9488" },
                      { name: "Royal / DC", color: "#2563eb" },
                      { name: "Pink / RR", color: "#ec4899" },
                      { name: "Navy / MI", color: "#1d4ed8" },
                      { name: "Crimson / RCB", color: "#dc2626" },
                      { name: "Sunset / SRH", color: "#ea580c" },
                      { name: "Wine / PBKS", color: "#b91c1c" },
                      { name: "Sky / VBSG", color: "#0284c7" },
                      { name: "Emerald", color: "#059669" },
                      { name: "Dark", color: "#0f172a" }
                    ].map((palette) => (
                      <button
                        key={palette.color}
                        type="button"
                        onClick={() => setEditTeam({ ...editTeam, themeColor: palette.color })}
                        title={palette.name}
                        className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 cursor-pointer ${
                          (editTeam.themeColor || "#0041b9").toLowerCase() === palette.color.toLowerCase()
                            ? "ring-2 ring-slate-800 scale-110 shadow-sm"
                            : "border-black/10"
                        }`}
                        style={{ backgroundColor: palette.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditTeam(null)}
                  disabled={savingTeam}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTeam}
                  className="flex-1 py-2.5 rounded-lg bg-[#0041b9] hover:bg-[#003399] disabled:bg-[#0041b9]/70 text-white font-bold text-xs cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed shadow-md"
                >
                  {savingTeam ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Team...</span>
                    </>
                  ) : (
                    <span>Save Team</span>
                  )}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Team Squad Roster"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewSquadTeam(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0041b9] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 cursor-pointer">
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
                          className="p-1.5 rounded-lg bg-blue-50 text-[#0041b9] hover:bg-blue-100 transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAssignTeam(player.id, "");
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
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
      {/* MODAL: REJECT PLAYER WITH REASON */}
      {/* ========================================================================= */}
      {rejectPlayerModal && (
        <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => { setRejectPlayerModal(null); setRejectReason(""); }}
              className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reject Player Registration</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{rejectPlayerModal.name} • ID: {rejectPlayerModal.regNumber || rejectPlayerModal.id}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Reason for Rejection <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Enter the reason for rejection. This will be sent to the player by email."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-xs resize-none outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">📧 This reason will be included in the rejection email sent to the player.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setRejectPlayerModal(null); setRejectReason(""); }}
                disabled={isRejecting}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
              >
                {isRejecting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Rejecting...</span></>
                ) : (
                  <span>Confirm Rejection</span>
                )}
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
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto cursor-pointer">
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
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING BULK OPERATIONS TOOLBAR */}
      {/* ========================================================================= */}
      {selectedIds.length > 0 && activeTab === "players" && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#081a36]/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 max-w-2xl w-[92%] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-xs border border-blue-400/30">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBatchApprove}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Bulk approve selected registrations"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => {
                setBatchRejectReason("");
                setBatchRejectModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Bulk reject selected registrations"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Reject ({selectedIds.length})</span>
            </button>

            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBatchAssignTeam(e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Assign Team...</option>
              <option value="unassign">— Unassign / Remove Team —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH REJECT MODAL */}
      {/* ========================================================================= */}
      {batchRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">
                  Reject {selectedIds.length} Selected Players
                </h3>
              </div>
              <button
                onClick={() => setBatchRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are about to mark <span className="font-bold text-red-600">{selectedIds.length}</span> player registration(s) as Rejected. Any team assignments for these players will be unassigned automatically.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason (will be recorded in notes)
              </label>
              <textarea
                rows={3}
                value={batchRejectReason}
                onChange={(e) => setBatchRejectReason(e.target.value)}
                placeholder="e.g., Address outside Ward 51/54 / Invalid payment proof / Underage..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Confirm Batch Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
