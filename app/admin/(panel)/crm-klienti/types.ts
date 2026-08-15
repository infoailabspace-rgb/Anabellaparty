export type CustomerType = "person" | "company";
export type Segment = "standard" | "vip" | "frequent" | "new";

export type CustomerRow = {
  id: string | null;
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  company_reg_nr: string;
  company_vat_nr: string;
  segment: Segment;
  discount_percent: number;
  notes: string;
};

export type ListRow = Omit<CustomerRow, "id"> & {
  id: string;
  created_at: string;
  booking_count: number;
};

export type BookingLite = {
  id: string;
  event_date: string;
  event_type: string;
  status: string;
  estimated_total: number | null;
  final_total: number | null;
  delivery_cost: number | null;
  paid_sum: number;
};

export const SEGMENTS: Segment[] = ["new", "standard", "frequent", "vip"];
export const SEGMENT_LABEL: Record<Segment, string> = {
  new: "Jauns",
  standard: "Standarta",
  frequent: "Regulārs",
  vip: "VIP",
};

export const TYPE_LABEL: Record<CustomerType, string> = {
  person: "Privātpersona",
  company: "Uzņēmums",
};

export const emptyCustomer: CustomerRow = {
  id: null,
  name: "",
  type: "person",
  email: "",
  phone: "",
  address: "",
  contact_person: "",
  company_reg_nr: "",
  company_vat_nr: "",
  segment: "new",
  discount_percent: 0,
  notes: "",
};
