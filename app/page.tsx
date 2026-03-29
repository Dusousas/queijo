import { redirect } from "next/navigation";
import { MvpDashboard } from "./_components/mvp-dashboard";
import { hasValidSession } from "@/lib/auth";

export default async function Home() {
  if (!(await hasValidSession())) {
    redirect("/login");
  }

  return <MvpDashboard />;
}
