import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle } from 'lucide-react';

export default async function TransactionHistoryPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const transactions = await prisma.transactionHistory.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage your transaction records
          </p>
        </div>
        <Link href="/dashboard/history/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            A list of all your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                <div>Title</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-5 gap-4 p-4">
                    <div className="truncate">{transaction.title}</div>
                    <div>${transaction.amount.toFixed(2)}</div>
                    <div>
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
                    <div>
                      {formatDistanceToNow(new Date(transaction.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <div>
                      <Link href={`/dashboard/history/${transaction.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No transactions found</p>
              <Link href="/dashboard/history/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Transaction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}