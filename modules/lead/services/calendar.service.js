// services/calendar.service.js

import { google } from "googleapis";

// Setup Google OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials (use a service account or refresh token)
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

/**
 * Create a Google Calendar event
 * @param {Object} eventData
 * @param {string} eventData.summary - Event title
 * @param {string} eventData.description - Event description
 * @param {string} eventData.startDateTime - ISO string start
 * @param {string} eventData.endDateTime - ISO string end
 * @param {string[]} eventData.attendees - Array of emails
 * @returns {Promise<Object>} The created event
 */
export default async function createEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendees = [],
}) {
  try {
    const event = await calendar.events.insert({
      calendarId: "primary", // or another calendar ID
      requestBody: {
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        attendees: attendees.map((email) => ({ email })),
        reminders: {
          useDefault: true,
        },
      },
    });
    return event.data;
  } catch (err) {
    console.error("Error creating Google Calendar event:", err);
    throw err;
  }
}

/**
 * Example: Delete an event by ID
 * @param {string} eventId
 */
export async function deleteEvent(eventId) {
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
    return true;
  } catch (err) {
    console.error("Error deleting Google Calendar event:", err);
    throw err;
  }
}
