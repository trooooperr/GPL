import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("[MongoDB] No MONGODB_URI provided in environment. Please add MONGODB_URI in Vercel Project Settings > Environment Variables.");
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
    bufferCommands: false, // In serverless, fail fast instead of hanging/buffering
    serverSelectionTimeoutMS: 10000, // 10s for Vercel cold starts
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
  };

  try {
    cached.promise = mongoose.connect(uri, opts);
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
  regNumber: { type: String, index: true },
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true, index: true },
  dob: String,
  age: Number,
  ward: { type: String, default: "Ward 51" },
  speciality: String,
  tshirtSize: String,
  trackSize: String,
  utrNumber: String,
  amount: { type: Number, default: 100 },
  paymentStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
  photoUrl: String,
  aadhaarFrontUrl: String,
  aadhaarBackUrl: String,
  paymentProofUrl: String,
  teamId: { type: String, default: null, index: true },
  notes: String,
  registeredAt: { type: String, default: () => new Date().toISOString(), index: true },
  history: [
    {
      timestamp: String,
      action: String,
      notes: String
    }
  ]
}, schemaOptions);

RegistrationSchema.index({ registeredAt: -1, createdAt: -1 });

const TeamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortCode: String,
  owner: String,
  captain: String,
  established: { type: String, default: "2024" },
  championships: { type: Number, default: 0 },
  logo: String,
  themeColor: { type: String, default: "#0041b9" },
  members: [String]
}, schemaOptions);

TeamSchema.index({ members: 1 });

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, schemaOptions);

const RuleSchema = new mongoose.Schema({
  rules: [String]
}, schemaOptions);

const FaqSchema = new mongoose.Schema({
  faqs: [{
    q: { type: String, required: true },
    a: { type: String, required: true }
  }]
}, schemaOptions);

const AuditSchema = new mongoose.Schema({
  id: String,
  timestamp: String,
  action: String,
  details: mongoose.Schema.Types.Mixed
}, schemaOptions);

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }
}, { collection: "counters" });

export const MongoRegistration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
export const MongoTeam = mongoose.models.Team || mongoose.model("Team", TeamSchema);
export const MongoSetting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
export const MongoRule = mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
export const MongoFaq = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);
export const MongoAudit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
export const MongoCounter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

/**
 * Recalculates and synchronizes the registration sequence counter with the highest
 * active numeric registration ID currently in the database.
 * If all players were deleted, sequence resets to 1000 so the next player becomes 1001.
 */
export async function syncRegistrationCounter() {
  await connectToDatabase();
  const counterId = "player_registration_seq";

  const players = await MongoRegistration.find().select("id regNumber").lean();
  let maxNumericId = 1000;
  for (const p of players) {
    const raw = p.regNumber || p.id || "";
    const digits = String(raw).replace(/\D/g, "");
    if (digits.length >= 4) {
      const val = parseInt(digits.slice(-4), 10);
      if (!isNaN(val) && val > maxNumericId) maxNumericId = val;
    } else if (digits.length > 0) {
      const val = parseInt(digits, 10);
      if (!isNaN(val) && val > maxNumericId) maxNumericId = val;
    }
  }

  await MongoCounter.findByIdAndUpdate(
    counterId,
    { $set: { seq: maxNumericId } },
    { upsert: true }
  );

  return maxNumericId;
}

/**
 * Atomic sequence generator: Guarantees sequential 4-digit numeric IDs (1001, 1002...)
 * dynamically synchronized with the highest active registration ID in MongoDB.
 * If previous test players were deleted, this ensures no abandoned gaps occur.
 */
export async function getNextPlayerId() {
  await connectToDatabase();
  const counterId = "player_registration_seq";

  // 1. Sync counter with the maximum active registration number currently in the database
  await syncRegistrationCounter();

  // 2. Atomic increment operation
  const result = await MongoCounter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  return String(result.seq);
}
