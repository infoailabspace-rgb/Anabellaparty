import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import NewBookingForm from "./new-booking-form";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function NewBookingPage() {
  const supabase = await createClient();
  const products = await getAllProducts();
  const { data } = await supabase
    .from("customers")
    .select("id, name, email, phone")
    .order("name", { ascending: true });
  const customers = (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone ?? "",
  }));

  return <NewBookingForm products={products} customers={customers} />;
}
