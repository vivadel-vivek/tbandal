import Link from "next/link";
import { VendorEditForm } from "@/components/admin/VendorEditForm";

export default function NewVendorPage() {
  return (
    <div>
      <Link href="/admin/contributor/vendors" className="back-link mb-3">
        ← All vendors
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New vendor
      </h1>
      <VendorEditForm vendor={null} />
    </div>
  );
}
