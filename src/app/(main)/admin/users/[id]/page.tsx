// TEMPORARILY DISABLED FOR TESTING
// This [id] dynamic route is catching ALL /admin/users/* routes!

import { notFound } from "next/navigation";

export default async function UserDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  console.log("🚨 [ID ROUTE] CAUGHT:", id);
  console.log("🚨 This should NOT catch /user-detail, /simple, etc!");
  
  // Return 404 for now to test if this is the problem
  notFound();
}
