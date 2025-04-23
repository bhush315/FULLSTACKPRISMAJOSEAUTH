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
import UserActions from "@/components/dashboard/admin/user-actions";

export default async function ManageUsersPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium">
              <div>Name</div>
              <div>Email</div>
              <div>Country</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-5 gap-4 p-4">
                  <div className="truncate">{user.fullName}</div>
                  <div className="truncate">{user.email}</div>
                  <div>{user.country || "Not specified"}</div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <UserActions
                      userId={user.id}
                      currentUserEmail={session.email}
                      userEmail={user.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
