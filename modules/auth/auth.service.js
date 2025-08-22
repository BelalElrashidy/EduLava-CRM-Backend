import supabase from "../../config/supabaseClient.js";

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  };
}
