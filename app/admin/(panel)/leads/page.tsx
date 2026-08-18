import { createClient } from "@/lib/supabase/server";
import LeadsList, { type Lead } from "./leads-list";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];
  return <LeadsList leads={leads} />;
}
