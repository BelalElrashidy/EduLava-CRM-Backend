// modules/lead/lead.service.js
import AvailabilityService from "./services/availability.service.js";
import CalendarService from "./services/calendar.service.js";
import supabase from "../../config/supabaseClient.js";

class LeadService {
  /**
   * Handles a new lead:
   * 1. Finds the next available slot based on teacher tiers and sales availability
   * 2. Creates a Google Calendar event with Google Meet link
   * 3. Saves lead in Supabase with assigned teacher, sales, session time, and meeting link
   * @param {Object} leadData - Minimal lead info
   */
  static async handleNewLead(leadData) {
    // 1. Determine session time & assign teacher/sales
    const { sessionTime, teacher, sales } =
      await AvailabilityService.findNextAvailableSlot();

    if (!sessionTime || !teacher || !sales) {
      throw new Error("No available slot found in the next 7 days.");
    }

    // 2. Create Google Calendar event
    const startISO = sessionTime.toISOString();
    const endISO = new Date(
      sessionTime.getTime() + 60 * 60 * 1000
    ).toISOString();

    const event = await CalendarService.createEvent({
      summary: `Session with ${leadData.parent_name}`,
      description: `Lead session for ${leadData.parent_name} (${leadData.email})`,
      startDateTime: startISO,
      endDateTime: endISO,
      attendees: [leadData.email, teacher.email, sales.email],
    });

    const meetingLink = event.hangoutLink;

    // 3. Save lead in Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          language: leadData.language || "ar",
          phone: leadData.phone,
          parent_name: leadData.parent_name,
          source: leadData.source,
          email: leadData.email,
          desired_course_id: leadData.desired_course_id,
          assigned_sales_id: sales.id,
          assigned_teacher_id: teacher.id,
          session_time: sessionTime,
          meeting_link: meetingLink,
          google_calendar_event_id: event.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default LeadService;
