// testInsert.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting test...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to database:", mongoose.connection.name);

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
    });

    const User = mongoose.model("User", userSchema);

    const newUser = await User.create({
      name: "Test User",
      email: "testuser@example.com",
    });

    console.log("👩‍💻 New user added:", newUser);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
  })
  .catch((err) => console.error("❌ Error:", err));
