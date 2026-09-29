import fs from "fs";
import path from "path";
import {
  connectToDatabase,
  MongoRegistration,
  MongoTeam,
  MongoSetting,
  MongoRule,
  MongoAudit
} from "./mongodb";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const RULES_FILE = path.join(DATA_DIR, "rules.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

export const INITIAL_SETTINGS = {
  upiId: "shahbazkhandm@okhdfcbank",
  upiPhone: "9820000000",
  qrCodeImage: "/images/qr-code.jpg",
  registrationFee: 100,
  maxCapacity: 140,
  registrationOpen: true,
  tournamentTitle: "Goregaon Premier League - Radhe Radhe Chashak",
  venue: "Sambhaji Maidan, Goregaon East, Mumbai",
  adminEmail: "goregaonpremierleague@gmail.com",
  adminUsername: "admin",
  adminPassword: "GPL@AdminNew2026"
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

class Database {
  constructor() {
    this.registrations = [];
    this.teams = [];
    this.settings = { ...INITIAL_SETTINGS };
    this.rules = [...INITIAL_RULES];
    this.auditLogs = [];
    this.initialized = false;
    this.mongoConnected = false;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        this.settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      }
      if (fs.existsSync(RULES_FILE)) {
        this.rules = JSON.parse(fs.readFileSync(RULES_FILE, "utf-8"));
      }
      if (fs.existsSync(TEAMS_FILE)) {
        this.teams = JSON.parse(fs.readFileSync(TEAMS_FILE, "utf-8"));
      }
      if (fs.existsSync(REGISTRATIONS_FILE)) {
        this.registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, "utf-8"));
      }
      if (fs.existsSync(AUDIT_FILE)) {
        this.auditLogs = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
      }
    } catch (err) {
      console.warn("[Local DB Warning] Could not read files, using defaults:", err.message);
    }

    this.initialized = true;

    // Connect to MongoDB asynchronously if MONGODB_URI is provided
    if (process.env.MONGODB_URI) {
      this.syncWithMongo().catch(err => {
        console.warn("[MongoDB Sync Notice] Running with local data while Mongo initializes:", err.message);
      });
    }
  }

  async syncWithMongo() {
    const conn = await connectToDatabase();
    if (!conn) return;
    this.mongoConnected = true;

    try {
      // 1. Sync Settings
      const mongoSettings = await MongoSetting.findOne({ key: "global_settings" }).lean();
      if (mongoSettings && mongoSettings.value) {
        this.settings = { ...this.settings, ...mongoSettings.value };
      } else {
        await MongoSetting.findOneAndUpdate(
          { key: "global_settings" },
          { key: "global_settings", value: this.settings },
          { upsert: true }
        );
      }

      // 2. Sync Rules
      const mongoRules = await MongoRule.findOne().lean();
      if (mongoRules && mongoRules.rules && mongoRules.rules.length > 0) {
        this.rules = mongoRules.rules;
      } else {
        await MongoRule.create({ rules: this.rules });
      }

      // 3. Sync Teams
      const mongoTeams = await MongoTeam.find().lean();
      if (mongoTeams && mongoTeams.length > 0) {
        this.teams = mongoTeams.map(t => ({
          id: t.id,
          name: t.name,
          shortCode: t.shortCode,
          owner: t.owner,
          captain: t.captain,
          established: t.established,
          championships: t.championships,
          logo: t.logo,
          members: t.members || []
        }));
      } else if (this.teams.length > 0) {
        await MongoTeam.insertMany(this.teams);
      }

      // 4. Sync Registrations
      const mongoRegs = await MongoRegistration.find().lean();
      if (mongoRegs && mongoRegs.length > 0) {
        this.registrations = mongoRegs.map(r => ({
          id: r.id,
          regNumber: r.regNumber || (r.id ? r.id.replace(/\D/g, "") : ""),
          name: r.name,
          email: r.email,
          phone: r.phone,
          dob: r.dob,
          age: r.age,
          ward: r.ward,
          speciality: r.speciality,
          tshirtSize: r.tshirtSize,
          trackSize: r.trackSize,
          utrNumber: r.utrNumber,
          amount: r.amount,
          paymentStatus: r.paymentStatus,
          photoUrl: r.photoUrl,
          aadhaarFrontUrl: r.aadhaarFrontUrl,
          aadhaarBackUrl: r.aadhaarBackUrl,
          paymentProofUrl: r.paymentProofUrl,
          teamId: r.teamId,
          notes: r.notes,
          registeredAt: r.registeredAt || r.createdAt,
          history: r.history || []
        }));
      } else if (this.registrations.length > 0) {
        await MongoRegistration.insertMany(this.registrations);
      }

      console.log(`[MongoDB] Synced ${this.teams.length} teams, ${this.registrations.length} registrations, settings & rules.`);
    } catch (err) {
      console.error("[MongoDB Sync Error]:", err.message);
    }
  }

  persistRegistrationsSync() {
    try {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(this.registrations, null, 2));
    } catch (e) {}
  }

  persistTeamsSync() {
    try {
      fs.writeFileSync(TEAMS_FILE, JSON.stringify(this.teams, null, 2));
    } catch (e) {}
  }

  persistSettingsSync() {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
    } catch (e) {}
  }

  persistRulesSync() {
    try {
      fs.writeFileSync(RULES_FILE, JSON.stringify(this.rules, null, 2));
    } catch (e) {}
  }

  logAudit(action, details = {}) {
    const log = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    try {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.auditLogs, null, 2));
    } catch (e) {}

    // Async MongoDB audit log
    if (process.env.MONGODB_URI) {
      MongoAudit.create(log).catch(() => {});
    }
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  getSettings() {
    return this.settings;
  }

  reloadSettingsFromDisk() {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        this.settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      }
    } catch (e) {}
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.persistSettingsSync();
    this.logAudit("UPDATE_SETTINGS", { updatedKeys: Object.keys(newSettings) });

    if (process.env.MONGODB_URI) {
      MongoSetting.findOneAndUpdate(
        { key: "global_settings" },
        { key: "global_settings", value: this.settings },
        { upsert: true }
      ).catch(e => console.error("[MongoDB Settings Update Error]:", e.message));
    }

    return this.settings;
  }

  getRules() {
    return this.rules;
  }

  updateRules(newRules) {
    this.rules = newRules;
    this.persistRulesSync();
    this.logAudit("UPDATE_RULES", { rulesCount: newRules.length });

    if (process.env.MONGODB_URI) {
      MongoRule.findOneAndUpdate({}, { rules: newRules }, { upsert: true })
        .catch(e => console.error("[MongoDB Rules Update Error]:", e.message));
    }

    return this.rules;
  }

  getStats() {
    this.reloadTeamsFromDisk();
    this.reloadRegistrationsFromDisk();
    this.reloadSettingsFromDisk();
    const totalTeams = this.teams && this.teams.length > 0 ? this.teams.length : 10;
    const maxCapacity = totalTeams * 14;
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
      upiId: this.settings.upiId || "shahbazkhandm@okhdfcbank"
    };
  }

  getSizingMatrix() {
    const matrix = {
      tshirts: { Small: 0, Medium: 0, Large: 0, "X-large": 0, "XX-Large": 0 },
      tracks: { "30": 0, "32": 0, "34": 0, "36": 0, "38": 0 },
      totalApproved: 0
    };

    for (const reg of this.registrations) {
      if (reg.paymentStatus === "Approved") {
        matrix.totalApproved++;
        if (matrix.tshirts[reg.tshirtSize] !== undefined) {
          matrix.tshirts[reg.tshirtSize]++;
        }
        if (matrix.tracks[reg.trackSize] !== undefined) {
          matrix.tracks[reg.trackSize]++;
        }
      }
    }
    return matrix;
  }

  getAllRegistrations() {
    this.reloadRegistrationsFromDisk();
    return this.registrations;
  }

  getRegistrationById(id) {
    return this.registrations.find(r => r.id === id);
  }

  addRegistration(playerData) {
    this.reloadRegistrationsFromDisk();
    const maxRegNum = this.registrations.reduce((max, r) => {
      const num = parseInt(r.regNumber || (r.id ? r.id.replace(/\D/g, "") : "0"), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);
    const regNumber = String(maxRegNum + 1);
    const id = `GPL-REG-${regNumber}`;

    const newRegistration = {
      id,
      regNumber,
      name: playerData.name,
      email: playerData.email || "",
      phone: playerData.phone,
      dob: playerData.dob || "",
      age: playerData.age || 24,
      ward: playerData.ward || "Ward 51",
      speciality: playerData.speciality || "Right-hand batsman",
      tshirtSize: playerData.tshirtSize || "Medium",
      trackSize: playerData.trackSize || "32",
      utrNumber: playerData.utrNumber || "",
      amount: playerData.amount || 100,
      paymentStatus: "Pending",
      photoUrl: playerData.photoUrl || "/images/avatar-placeholder.svg",
      aadhaarFrontUrl: playerData.aadhaarFrontUrl || "/images/doc-placeholder.svg",
      aadhaarBackUrl: playerData.aadhaarBackUrl || "/images/doc-placeholder.svg",
      paymentProofUrl: playerData.paymentProofUrl || "/images/payment-placeholder.svg",
      teamId: null,
      notes: playerData.notes || "",
      registeredAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "REGISTERED",
          notes: "Player self-registered via public portal"
        }
      ]
    };

    this.registrations.unshift(newRegistration);
    this.persistRegistrationsSync();
    this.logAudit("NEW_REGISTRATION", { playerId: id, name: playerData.name, phone: playerData.phone });

    // Save to MongoDB
    if (process.env.MONGODB_URI) {
      MongoRegistration.create(newRegistration)
        .catch(e => console.error("[MongoDB Add Registration Error]:", e.message));
    }

    return newRegistration;
  }

  updateRegistrationStatus(id, status, notes = "") {
    this.reloadRegistrationsFromDisk();
    const index = this.registrations.findIndex(r => r.id === id);
    if (index === -1) return null;

    const prevStatus = this.registrations[index].paymentStatus;
    this.registrations[index].paymentStatus = status;
    if (notes) {
      this.registrations[index].notes = notes;
    }

    if (!this.registrations[index].history) {
      this.registrations[index].history = [];
    }

    this.registrations[index].history.push({
      timestamp: new Date().toISOString(),
      action: `STATUS_CHANGE_${status.toUpperCase()}`,
      notes: notes || `Status changed from ${prevStatus} to ${status}`
    });

    this.persistRegistrationsSync();
    this.logAudit("UPDATE_PLAYER_STATUS", { playerId: id, oldStatus: prevStatus, newStatus: status, notes });

    // Update in MongoDB
    if (process.env.MONGODB_URI) {
      MongoRegistration.findOneAndUpdate(
        { id },
        { paymentStatus: status, notes, history: this.registrations[index].history }
      ).catch(e => console.error("[MongoDB Status Update Error]:", e.message));
    }

    return this.registrations[index];
  }

  updatePlayer(id, updateData) {
    this.reloadRegistrationsFromDisk();
    const index = this.registrations.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.registrations[index] = { ...this.registrations[index], ...updateData };
    this.persistRegistrationsSync();
    this.logAudit("EDIT_PLAYER", { playerId: id, updatedFields: Object.keys(updateData) });

    if (process.env.MONGODB_URI) {
      MongoRegistration.findOneAndUpdate({ id }, updateData)
        .catch(e => console.error("[MongoDB Player Edit Error]:", e.message));
    }

    return this.registrations[index];
  }

  deletePlayer(id) {
    this.reloadRegistrationsFromDisk();
    const index = this.registrations.findIndex(r => r.id === id);
    if (index === -1) return false;

    const removed = this.registrations.splice(index, 1)[0];
    this.persistRegistrationsSync();

    // Remove from assigned team if any
    for (const team of this.teams) {
      if (team.members && team.members.includes(id)) {
        team.members = team.members.filter(mId => mId !== id);
        this.persistTeamsSync();
        if (process.env.MONGODB_URI) {
          MongoTeam.findOneAndUpdate({ id: team.id }, { members: team.members }).catch(() => {});
        }
      }
    }

    this.logAudit("DELETE_PLAYER", { playerId: id, name: removed.name });

    if (process.env.MONGODB_URI) {
      MongoRegistration.findOneAndDelete({ id })
        .catch(e => console.error("[MongoDB Delete Player Error]:", e.message));
    }

    return true;
  }

  reloadTeamsFromDisk() {
    try {
      if (fs.existsSync(TEAMS_FILE)) {
        this.teams = JSON.parse(fs.readFileSync(TEAMS_FILE, "utf-8"));
      }
    } catch (e) {}
  }

  reloadRegistrationsFromDisk() {
    try {
      if (fs.existsSync(REGISTRATIONS_FILE)) {
        this.registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, "utf-8"));
      }
    } catch (e) {}
  }

  getAllTeams() {
    this.reloadTeamsFromDisk();
    this.reloadRegistrationsFromDisk();
    return this.teams.map(team => {
      const memberIds = team.members || [];
      const memberDetails = memberIds
        .map(id => this.registrations.find(r => r.id === id))
        .filter(Boolean);

      return {
        ...team,
        members: memberIds,
        memberDetails
      };
    });
  }

  addTeam(teamData) {
    this.reloadTeamsFromDisk();
    const id = teamData.id || `team-${Date.now()}`;
    const newTeam = {
      id,
      name: teamData.name,
      shortCode: teamData.shortCode || teamData.name.slice(0, 3).toUpperCase(),
      owner: teamData.owner || "TBD",
      captain: teamData.captain || "TBD",
      established: teamData.established || "2026",
      championships: Number(teamData.championships) || 0,
      logo: teamData.logo || "/images/teams/team-csk.png",
      members: []
    };

    this.teams.push(newTeam);
    this.persistTeamsSync();
    this.logAudit("ADD_TEAM", { teamId: id, name: newTeam.name });

    if (process.env.MONGODB_URI) {
      MongoTeam.create(newTeam).catch(e => console.error("[MongoDB Add Team Error]:", e.message));
    }

    return newTeam;
  }

  updateTeam(id, updateData) {
    this.reloadTeamsFromDisk();
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.teams[index] = { ...this.teams[index], ...updateData };
    this.persistTeamsSync();
    this.logAudit("UPDATE_TEAM", { teamId: id, name: this.teams[index].name });

    if (process.env.MONGODB_URI) {
      MongoTeam.findOneAndUpdate({ id }, updateData)
        .catch(e => console.error("[MongoDB Update Team Error]:", e.message));
    }

    return this.teams[index];
  }

  deleteTeam(id) {
    this.reloadTeamsFromDisk();
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) return false;

    const removed = this.teams.splice(index, 1)[0];
    this.persistTeamsSync();

    // Reset assigned players' teamId
    for (const reg of this.registrations) {
      if (reg.teamId === id) {
        reg.teamId = null;
      }
    }
    this.persistRegistrationsSync();

    this.logAudit("DELETE_TEAM", { teamId: id, name: removed.name });

    if (process.env.MONGODB_URI) {
      MongoTeam.findOneAndDelete({ id }).catch(() => {});
      MongoRegistration.updateMany({ teamId: id }, { teamId: null }).catch(() => {});
    }

    return true;
  }

  assignPlayerToTeam(teamId, playerId) {
    this.reloadTeamsFromDisk();
    this.reloadRegistrationsFromDisk();

    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    const playerIndex = this.registrations.findIndex(r => r.id === playerId);

    if (teamIndex === -1 || playerIndex === -1) {
      return { success: false, message: "Team or Player not found" };
    }

    // Remove from previous team
    for (const t of this.teams) {
      if (t.members && t.members.includes(playerId)) {
        t.members = t.members.filter(mId => mId !== playerId);
      }
    }

    if (!this.teams[teamIndex].members) {
      this.teams[teamIndex].members = [];
    }

    if (this.teams[teamIndex].members.length >= 14) {
      return { success: false, message: "Team squad is already full (14/14 players limit reached)." };
    }

    this.teams[teamIndex].members.push(playerId);
    this.registrations[playerIndex].teamId = teamId;

    this.persistTeamsSync();
    this.persistRegistrationsSync();
    this.logAudit("ASSIGN_PLAYER_TEAM", { playerId, teamId, teamName: this.teams[teamIndex].name });

    if (process.env.MONGODB_URI) {
      MongoTeam.findOneAndUpdate({ id: teamId }, { members: this.teams[teamIndex].members }).catch(() => {});
      MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId }).catch(() => {});
    }

    return { success: true, team: this.teams[teamIndex], player: this.registrations[playerIndex] };
  }
}

export const db = new Database();
