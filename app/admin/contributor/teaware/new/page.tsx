import Link from "next/link";
import { TeawareEditForm } from "@/components/admin/TeawareEditForm";

export default function NewTeawarePage() {
  return (
    <div>
      <Link href="/admin/contributor/teaware" className="back-link mb-3">
        ← All teaware
      </Link>
      <h1 className="font-display italic text-burgundy text-[28px] m-0 mb-5">
        New teaware
      </h1>
      <TeawareEditForm item={null} />
    </div>
  );
}
