import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account details
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your personal details and preferences
            </CardDescription>
          </div>
          <Link href="/dashboard/profile/edit">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Full Name</div>
            <div className="text-base">{user.fullName}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Email</div>
            <div className="text-base">{user.email}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Country</div>
            <div className="text-base">{user.country || 'Not specified'}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Account Type</div>
            <div className="text-base">{user.role}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Member Since</div>
            <div className="text-base">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/profile/edit">
          <Card className="h-full cursor-pointer transition-all hover:border-blue-400">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Change your name, email, country and other personal details
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/profile/password">
          <Card className="h-full cursor-pointer transition-all hover:border-blue-400">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                It's a good idea to use a strong password that you don't use elsewhere
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}