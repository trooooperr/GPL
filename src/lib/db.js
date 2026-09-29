import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const RULES_FILE = path.join(DATA_DIR, "rules.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const INITIAL_SETTINGS = {
  upiId: "shahbazkhandm@okhdfcbank",
  upiPhone: "9820000000",
  qrCodeImage: "/images/qr-code.jpg",
  registrationFee: 100,
  maxCapacity: 140,
  registrationOpen: true,
  tournamentTitle: "Goregaon Premier League - Radhe Radhe Chashak",
  venue: "Sambhaji Maidan, Goregaon East, Mumbai"
};

export const INITIAL_RULES = [
  "It's going to be a league matches",
  "Match Will Be on Friday, Saturday & Sunday",
  "Every match will be 5 over match",
  "Under 21 and above 40 – first match (1 over bowling or batting compulsory)",
  "Player Aadhaar card or voter ID should be from ward 51 or 54 Goregaon East",
  "Umpire decision will be final decision",
  "5 runs penalty if the team is not present on time",
  "Teams who will not take full list of players will face 3 runs penalty in all the league match",
  "Teams who has short players will have to follow powerplay rule and 5-4 rules",
  "Youtube live",
  "No player will be shifted or given any replacement once the auction is done",
  "Foul language or misbehavior with the management or umpire will lead to penalty of 5 runs"
];

export const INITIAL_TEAMS = [
  {
    id: "team-1",
    name: "Colony Super Kings",
    shortCode: "CSK",
    owner: "Mohsin Bhai & Ballu Bhai",
    captain: "Colony Captain",
    established: "2024",
    championships: 2,
    logo: "/images/teams/team-csk.png",
    members: []
  },
  {
    id: "team-2",
    name: "Koyna Knight Rider",
    shortCode: "KKR",
    owner: "Koyna Sports Club",
    captain: "Knight Captain",
    established: "2024",
    championships: 1,
    logo: "/images/teams/team-kkr.png",
    members: []
  },
  {
    id: "team-3",
    name: "Gogtewadi Titans",
    shortCode: "GT",
    owner: "Gogtewadi Group",
    captain: "Titans Captain",
    established: "2024",
    championships: 1,
    logo: "/images/teams/team-gt.png",
    members: []
  },
  {
    id: "team-4",
    name: "Durgabhavani Capital",
    shortCode: "DC",
    owner: "Durgabhavani Mitra Mandal",
    captain: "Capital Captain",
    established: "2024",
    championships: 0,
    logo: "/images/teams/team-dc.png",
    members: []
  },
  {
    id: "team-5",
    name: "Radhe Radhe",
    shortCode: "RR",
    owner: "Radhe Radhe Committee",
    captain: "Radhe Captain",
    established: "2024",
    championships: 2,
    logo: "/images/teams/team-rr.png",
    members: []
  },
  {
    id: "team-6",
    name: "Murli Chawl Indians",
    shortCode: "MI",
    owner: "Murli Chawl Group",
    captain: "Indians Captain",
    established: "2024",
    championships: 1,
    logo: "/images/teams/team-mi.png",
    members: []
  },
  {
    id: "team-7",
    name: "Royal Challengers Bhimnagar",
    shortCode: "RCB",
    owner: "Bhimnagar Sports Club",
    captain: "Challengers Captain",
    established: "2024",
    championships: 0,
    logo: "/images/teams/team-rcb.png",
    members: []
  },
  {
    id: "team-8",
    name: "Sunrisers Hanuman Tekdi",
    shortCode: "SRH",
    owner: "Hanuman Tekdi Group",
    captain: "Sunrisers Captain",
    established: "2024",
    championships: 1,
    logo: "/images/teams/team-srh.png",
    members: []
  },
  {
    id: "team-9",
    name: "Panch Bawdi Kings",
    shortCode: "PBKS",
    owner: "Panch Bawdi Youth Club",
    captain: "Kings Captain",
    established: "2024",
    championships: 0,
    logo: "/images/teams/team-pbks.png",
    members: []
  },
  {
    id: "team-10",
    name: "Vitt Bhatti Super Giants",
    shortCode: "VBSG",
    owner: "Vitt Bhatti Sports",
    captain: "Giants Captain",
    established: "2024",
    championships: 1,
    logo: "/images/teams/team-vbsg.png",
    members: []
  }
];

class DatabaseManager {
  constructor() {
    this.registrations = [];
    this.teams = [...INITIAL_TEAMS];
    this.settings = { ...INITIAL_SETTINGS };
    this.rules = [...INITIAL_RULES];
    this.auditLogs = [];
    this.init();
  }

  init() {
    // Registrations
    try {
      if (fs.existsSync(REGISTRATIONS_FILE)) {
        const raw = fs.readFileSync(REGISTRATIONS_FILE, "utf8");
        this.registrations = JSON.parse(raw);
      } else {
        this.registrations = [];
        this.persistRegistrationsSync();
      }
    } catch (err) {
      this.registrations = [];
    }

    // Teams
    try {
      if (fs.existsSync(TEAMS_FILE)) {
        const raw = fs.readFileSync(TEAMS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        this.teams = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_TEAMS];
      } else {
        this.teams = [...INITIAL_TEAMS];
        this.persistTeamsSync();
      }
    } catch (err) {
      this.teams = [...INITIAL_TEAMS];
    }

    // Settings
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
        this.settings = { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
      } else {
        this.settings = { ...INITIAL_SETTINGS };
        this.persistSettingsSync();
      }
    } catch (err) {
      this.settings = { ...INITIAL_SETTINGS };
    }

    // Rules
    try {
      if (fs.existsSync(RULES_FILE)) {
        const raw = fs.readFileSync(RULES_FILE, "utf8");
        const parsed = JSON.parse(raw);
        this.rules = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_RULES];
      } else {
        this.rules = [...INITIAL_RULES];
        this.persistRulesSync();
      }
    } catch (err) {
      this.rules = [...INITIAL_RULES];
    }

    // Audit Logs
    try {
      if (fs.existsSync(AUDIT_FILE)) {
        const raw = fs.readFileSync(AUDIT_FILE, "utf8");
        this.auditLogs = JSON.parse(raw);
      } else {
        this.auditLogs = [];
      }
    } catch (err) {
      this.auditLogs = [];
    }
  }

  persistRegistrationsSync() {
    try {
      const tempPath = `${REGISTRATIONS_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.registrations, null, 2), "utf8");
      fs.renameSync(tempPath, REGISTRATIONS_FILE);
    } catch (e) {
      console.error("Failed to persist registrations:", e);
    }
  }

  persistTeamsSync() {
    try {
      const tempPath = `${TEAMS_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.teams, null, 2), "utf8");
      fs.renameSync(tempPath, TEAMS_FILE);
    } catch (e) {
      console.error("Failed to persist teams:", e);
    }
  }

  persistSettingsSync() {
    try {
      const tempPath = `${SETTINGS_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.settings, null, 2), "utf8");
      fs.renameSync(tempPath, SETTINGS_FILE);
    } catch (e) {
      console.error("Failed to persist settings:", e);
    }
  }

  persistRulesSync() {
    try {
      const tempPath = `${RULES_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.rules, null, 2), "utf8");
      fs.renameSync(tempPath, RULES_FILE);
    } catch (e) {
      console.error("Failed to persist rules:", e);
    }
  }

  logAudit(action, details) {
    const entry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    try {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.auditLogs, null, 2), "utf8");
    } catch (e) {}
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  // --- SETTINGS ---
  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.persistSettingsSync();
    this.logAudit("SETTINGS_UPDATED", { upiId: this.settings.upiId, upiPhone: this.settings.upiPhone });
    return this.settings;
  }

  // --- RULES ---
  getRules() {
    return this.rules;
  }

  updateRules(newRules) {
    if (Array.isArray(newRules)) {
      this.rules = newRules.filter(r => r && r.trim().length > 0);
      this.persistRulesSync();
      this.logAudit("RULES_UPDATED", { totalRules: this.rules.length });
    }
    return this.rules;
  }

  // --- STATS ---
  getStats() {
    this.reloadTeamsFromDisk();
    this.reloadRegistrationsFromDisk();
    const totalTeams = this.teams && this.teams.length > 0 ? this.teams.length : 10;
    const maxCapacity = (Number(this.settings.maxCapacity) && Number(this.settings.maxCapacity) !== 168) ? Number(this.settings.maxCapacity) : totalTeams * 14;
    const total = this.registrations.length;
    const approved = this.registrations.filter(r => r.paymentStatus === "Approved").length;
    const pending = this.registrations.filter(r => r.paymentStatus === "Pending").length;
    const rejected = this.registrations.filter(r => r.paymentStatus === "Rejected").length;
    const remainingSlots = Math.max(0, maxCapacity - total);

    return {
      maxCapacity,
      totalRegistered: total,
      approved,
      pending,
      rejected,
      remainingSlots,
      isFull: remainingSlots === 0,
      totalTeams: this.teams.length,
      registrationFee: this.settings.registrationFee || 100,
      upiId: this.settings.upiId,
      upiPhone: this.settings.upiPhone,
      qrCodeImage: this.settings.qrCodeImage
    };
  }

  getSizingMatrix() {
    const tshirts = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    const tracks = { "30": 0, "32": 0, "34": 0, "36": 0, "38": 0, "40": 0 };

    for (const r of this.registrations) {
      if (tshirts[r.tshirtSize] !== undefined) tshirts[r.tshirtSize]++;
      if (tracks[r.trackSize] !== undefined) tracks[r.trackSize]++;
    }

    return { tshirts, tracks, totalPlayers: this.registrations.length };
  }

  // --- REGISTRATIONS ---
  getAllRegistrations() {
    return this.registrations;
  }

  getRegistrationById(id) {
    return this.registrations.find(r => r.id === id);
  }

  addRegistration(playerData) {
    const maxCap = Number(this.settings.maxCapacity) || 168;
    if (this.registrations.length >= maxCap) {
      throw new Error(`Tournament registration is now full (${maxCap}/${maxCap} spots filled).`);
    }

    const duplicate = this.registrations.find(
      r => r.phone === playerData.phone || (playerData.email && r.email && r.email.toLowerCase() === playerData.email.toLowerCase())
    );
    if (duplicate) {
      throw new Error(`A player with phone ${playerData.phone} is already registered.`);
    }

    const regId = `GPL-REG-${1000 + this.registrations.length + 1}`;
    const newPlayer = {
      id: regId,
      ...playerData,
      registeredAt: new Date().toISOString(),
      paymentStatus: playerData.paymentStatus || "Pending",
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "Player Registered",
          notes: `Initial registration submitted with UTR: ${playerData.utrNumber || "N/A"}`
        }
      ],
      teamId: playerData.teamId || null
    };

    this.registrations.unshift(newPlayer);
    this.persistRegistrationsSync();
    this.logAudit("PLAYER_REGISTERED", { id: regId, name: playerData.name, phone: playerData.phone });
    return newPlayer;
  }

  updatePlayer(id, updatedFields) {
    const playerIndex = this.registrations.findIndex(r => r.id === id);
    if (playerIndex === -1) return null;

    const oldPlayer = this.registrations[playerIndex];
    const updated = {
      ...oldPlayer,
      ...updatedFields,
      id: oldPlayer.id // lock ID
    };

    if (!updated.history) updated.history = [];
    updated.history.unshift({
      timestamp: new Date().toISOString(),
      action: "Admin Edited Player Details",
      notes: `Fields updated by Admin`
    });

    this.registrations[playerIndex] = updated;
    this.persistRegistrationsSync();
    this.logAudit("PLAYER_EDITED", { id, name: updated.name });
    return updated;
  }

  updateRegistrationStatus(id, status, notes) {
    const player = this.registrations.find(r => r.id === id);
    if (!player) return null;

    const oldStatus = player.paymentStatus;
    player.paymentStatus = status;
    if (notes !== undefined) player.notes = notes;

    if (!player.history) player.history = [];
    player.history.unshift({
      timestamp: new Date().toISOString(),
      action: `Status changed from ${oldStatus} to ${status}`,
      notes: notes || "Updated by Admin"
    });

    this.persistRegistrationsSync();
    this.logAudit("STATUS_UPDATED", { id, name: player.name, oldStatus, newStatus: status });
    return player;
  }

  deletePlayer(id) {
    const idx = this.registrations.findIndex(r => r.id === id);
    if (idx === -1) return false;

    const deleted = this.registrations[idx];
    this.registrations.splice(idx, 1);

    // remove from any team
    for (const t of this.teams) {
      t.members = t.members.filter(m => m !== id);
    }
    this.persistTeamsSync();
    this.persistRegistrationsSync();
    this.logAudit("PLAYER_DELETED", { id, name: deleted.name });
    return true;
  }


  reloadTeamsFromDisk() {
    try {
      if (fs.existsSync(TEAMS_FILE)) {
        const raw = fs.readFileSync(TEAMS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.teams = parsed;
        }
      }
    } catch (e) {}
  }

  reloadRegistrationsFromDisk() {
    try {
      if (fs.existsSync(REGISTRATIONS_FILE)) {
        const raw = fs.readFileSync(REGISTRATIONS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.registrations = parsed;
        }
      }
    } catch (e) {}
  }

  // --- TEAMS ---
  getAllTeams() {
    this.reloadTeamsFromDisk();
    const playerMap = new Map(this.registrations.map(r => [r.id, r]));
    const teamsList = this.teams && this.teams.length > 0 ? this.teams : INITIAL_TEAMS;
    return teamsList.map(team => ({
      ...team,
      memberDetails: (team.members || []).map(mid => playerMap.get(mid)).filter(Boolean)
    }));
  }

  addTeam(teamData) {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name || "New Team",
      shortCode: teamData.shortCode || "NT",
      owner: teamData.owner || "Team Owner",
      captain: teamData.captain || "Team Captain",
      established: teamData.established || "2026",
      championships: Number(teamData.championships) || 0,
      logo: teamData.logo || "/images/teams/team-flying-eagles.png",
      members: []
    };
    this.teams.push(newTeam);
    this.persistTeamsSync();
    this.logAudit("TEAM_CREATED", { id: newTeam.id, name: newTeam.name });
    return newTeam;
  }

  updateTeam(id, updatedFields) {
    const team = this.teams.find(t => t.id === id);
    if (!team) return null;
    Object.assign(team, updatedFields, { id });
    this.persistTeamsSync();
    this.logAudit("TEAM_UPDATED", { id, name: team.name });
    return team;
  }

  deleteTeam(id) {
    const idx = this.teams.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const deleted = this.teams[idx];
    this.teams.splice(idx, 1);

    // unassign members
    for (const r of this.registrations) {
      if (r.teamId === id) r.teamId = null;
    }
    this.persistRegistrationsSync();
    this.persistTeamsSync();
    this.logAudit("TEAM_DELETED", { id, name: deleted.name });
    return true;
  }

  assignPlayerToTeam(playerId, teamId) {
    const player = this.registrations.find(r => r.id === playerId);
    if (!player) throw new Error("Player not found");

    for (const t of this.teams) {
      t.members = t.members.filter(m => m !== playerId);
    }

    if (teamId) {
      const team = this.teams.find(t => t.id === teamId);
      if (!team) throw new Error("Target team not found");
      if (!team.members.includes(playerId)) {
        team.members.push(playerId);
      }
      player.teamId = teamId;
    } else {
      player.teamId = null;
    }

    this.persistTeamsSync();
    this.persistRegistrationsSync();
    this.logAudit("TEAM_ASSIGNMENT", { playerId, teamId });
    return { player, teams: this.teams };
  }
}

const globalForDb = globalThis;
export const db = new DatabaseManager();
globalForDb.__gplDatabase = db;
