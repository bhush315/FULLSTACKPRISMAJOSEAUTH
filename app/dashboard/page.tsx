import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import DashboardStatsCard from '@/components/dashboard/stats-card';
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      transactionHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Calculate stats
  const totalTransactions = await prisma.transactionHistory.count({
    where: { userId: user.id },
  });
  
  const totalAmount = await prisma.transactionHistory.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  const pendingTransactions = await prisma.transactionHistory.count({
    where: { 
      userId: user.id,
      status: 'pending'
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.fullName}!
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard 
          title="Total Transactions"
          value={totalTransactions}
          description="All time transactions"
          icon={<Activity className="h-4 w-4 text-blue-500" />}
        />
        <DashboardStatsCard 
          title="Total Amount"
          value={totalAmount._sum.amount ? `$${totalAmount._sum.amount.toFixed(2)}` : '$0.00'}
          description="Lifetime value"
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
        />
        <DashboardStatsCard 
          title="Pending"
          value={pendingTransactions}
          description="Awaiting completion"
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        />
        {session.role === 'ADMIN' && (
          <DashboardStatsCard 
            title="Total Users"
            value={await prisma.user.count()}
            description="Registered accounts"
            icon={<Users className="h-4 w-4 text-purple-500" />}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your most recent transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.transactionHistory.length > 0 ? (
              <div className="space-y-4">
                {user.transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{transaction.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No transactions found. Create a new transaction to get started.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform from here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <a 
                href="/dashboard/history/new" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Create New Transaction
              </a>
              <a 
                href="/dashboard/profile" 
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Update Profile
              </a>
              <a 
                href="/dashboard/history" 
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                View All Transactions
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}