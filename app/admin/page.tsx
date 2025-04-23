import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import DashboardStatsCard from "@/components/dashboard/stats-card";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();
  const adminUsers = await prisma.user.count({
    where: { role: "ADMIN" },
  });
  const regularUsers = await prisma.user.count({
    where: { role: "USER" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.fullName}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStatsCard
          title="Total Users"
          value={totalUsers}
          description="All registered users"
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        <DashboardStatsCard
          title="Admin Users"
          value={adminUsers}
          description="Users with admin privileges"
          icon={<Users className="h-4 w-4 text-purple-500" />}
        />
        <DashboardStatsCard
          title="Regular Users"
          value={regularUsers}
          description="Standard user accounts"
          icon={<Users className="h-4 w-4 text-green-500" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>
            Quick access to administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Manage Users
                </a>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
