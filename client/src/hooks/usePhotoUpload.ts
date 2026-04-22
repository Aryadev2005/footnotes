// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready

export const uploadPhoto = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("photos").upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
};
