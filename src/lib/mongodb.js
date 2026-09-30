import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("[MongoDB] No MONGODB_URI provided in environment.");
  }

  // If already connected and ready, return existing connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If currently connecting, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState === 1) return cached.conn;
    } catch (e) {
      cached.promise = null;
    }
  }

  const opts = {
    bufferCommands: true,  // Allow buffering so operations wait for connection
    serverSelectionTimeoutMS: 10000, // 10s for Vercel cold starts
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
  };

  try {
    cached.promise = mongoose.connect(MONGODB_URI, opts);
    cached.conn = await cached.promise;
    console.log("[MongoDB] Connected successfully");
    return cached.conn;
  } catch (err) {
    console.error("[MongoDB Connect Error]:", err.message);
    cached.promise = null;
    cached.conn = null;
    throw err; // Throw so callers know it failed
  }
}

const schemaOptions = { timestamps: true };

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
}, schemaOptions);

const TeamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortCode: String,
  owner: String,
  captain: String,
  established: { type: String, default: "2024" },
  championships: { type: Number, default: 0 },
  logo: String,
  members: [String]
}, schemaOptions);

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, schemaOptions);

const RuleSchema = new mongoose.Schema({
  rules: [String]
}, schemaOptions);

const AuditSchema = new mongoose.Schema({
  id: String,
  timestamp: String,
  action: String,
  details: mongoose.Schema.Types.Mixed
}, schemaOptions);

export const MongoRegistration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
export const MongoTeam = mongoose.models.Team || mongoose.model("Team", TeamSchema);
export const MongoSetting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
export const MongoRule = mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
export const MongoAudit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
