import { signInUser } from "./auth.service.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const tokenData = await signInUser(email, password);

    res.json(tokenData);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
