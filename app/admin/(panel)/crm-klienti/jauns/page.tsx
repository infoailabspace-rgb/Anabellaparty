import CrmDetail from "../crm-detail";
import { emptyCustomer } from "../types";

export const dynamic = "force-dynamic";

export default function NewCustomerPage() {
  return <CrmDetail customer={emptyCustomer} bookings={[]} />;
}
