import supabase from "../../../config/supabaseClient.js";

const tierPriority = ["Master", "Senior", "Junior", "Intern"];

class AvailabilityService {
  /**
   * Find next available slot for teacher and sales
   * @param {Date} desiredTime - start checking from this time (usually tomorrow same time)
   */
  static async findNextAvailableSlot(desiredTime = null) {
    desiredTime = desiredTime || new Date();
    // Round to next hour
    desiredTime.setMinutes(0, 0, 0);
    desiredTime.setDate(desiredTime.getDate() + 1); // start from tomorrow

    let found = false;
    let sessionTime = new Date(desiredTime);
    let teacher = null;
    let sales = null;

    while (!found) {
      const dayOfWeek = sessionTime.getDay(); // 0=Sunday
      const timeStr = sessionTime.toTimeString().split(" ")[0]; // "HH:MM:SS"

      // Query teachers and sales in one shot
      const { data: users, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          extras,
          role,
          availability!inner(
            start_time,
            end_time,
            day_of_week
          )
        `
        )
        .eq("availability.day_of_week", dayOfWeek);
      // const {data,erro} = await supabase.from()
      if (error) throw error;

      // Split by role
      const teachers = users
        .filter((u) => u.role === "teacher")
        .sort(
          (a, b) =>
            tierPriority.indexOf(a.extras.tier) -
            tierPriority.indexOf(b.extras.tier)
        );

      const salesReps = users.filter((u) => u.role === "sales");

      // Check availability
      teacher = teachers.find(
        (t) =>
          t.availability.start_time <= timeStr &&
          t.availability.end_time > timeStr
      );

      sales = salesReps.find(
        (s) =>
          s.availability.start_time <= timeStr &&
          s.availability.end_time > timeStr
      );

      if (teacher && sales) {
        found = true;
      } else {
        sessionTime.setHours(sessionTime.getHours() + 1); // move 1 hour forward
      }
    }

    return {
      sessionTime,
      teacherId: teacher.id,
      salesId: sales.id,
    };
  }
}

export default AvailabilityService;
