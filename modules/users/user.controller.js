import { getUserById } from "./user.service.js";

export async function getProfile(req, res) {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
