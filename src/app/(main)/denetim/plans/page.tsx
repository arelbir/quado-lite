import { redirect } from "next/navigation";

export default function PlansPage() {
  redirect("/denetim/all?tab=plans");
}
