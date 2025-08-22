import LeadService from "./lead.service.js";

export const createLead = async (req, res) => {
  try {
    const leadData = req.body;
    const savedLead = await LeadService.handleNewLead(leadData);
    res.status(201).json(savedLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
};
