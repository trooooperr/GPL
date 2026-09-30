import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn("[MongoDB] No MONGODB_URI environment variable provided.");
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("[MongoDB] Connected successfully to Atlas cluster");
      return mongooseInstance;
    }).catch((err) => {
      console.error("[MongoDB Connect Error]:", err.message);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }
}

// Mongoose Schemas
const RegistrationSchema = new mongoose.Schema({
  regNumber: { type: String },
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  dob: String,
  age: Number,
  ward: { type: String, default: "Ward 51" },
  speciality: String,
  tshirtSize: String,
  trackSize: String,
  utrNumber: String,
  amount: { type: Number, default: 100 },
  paymentStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  photoUrl: String,
  aadhaarFrontUrl: String,
  aadhaarBackUrl: String,
  paymentProofUrl: String,
  teamId: { type: String, default: null },
  notes: String,
  registeredAt: { type: String, default: () => new Date().toISOString() },
  history: [
    {
      timestamp: String,
      action: String,
      notes: String
    }
  ]
}, { timestamps: true });

const TeamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortCode: String,
  owner: String,
  captain: String,
  established: { type: String, default: "2026" },
  championships: { type: Number, default: 0 },
  logo: String,
  members: [String]
}, { timestamps: true });

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const RuleSchema = new mongoose.Schema({
  rules: [String]
}, { timestamps: true });

const AuditSchema = new mongoose.Schema({
  id: String,
  timestamp: String,
  action: String,
  details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export const MongoRegistration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
export const MongoTeam = mongoose.models.Team || mongoose.model("Team", TeamSchema);
export const MongoSetting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
export const MongoRule = mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
export const MongoAudit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
