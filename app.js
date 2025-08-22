import express from "express";
import usersRoutes from "./modules/users/user.routes.js";
import supabase from "./config/supabaseClient.js";
import authRoutes from "./modules/auth/auth.routes.js";
import leadRoutes from "./modules/lead/lead.routes.js";

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const { error } = await supabase.from("client").select("id").limit(1);
    if (error) throw error;

    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", database: "disconnected", error: err.message });
  }
});

app.use("/api/users", usersRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/lead", leadRoutes);

export default app;
