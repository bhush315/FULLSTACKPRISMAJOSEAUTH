import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';

type TransactionPageProps = {
  params: {
    id: string;
  };
};

export default async function TransactionDetailsPage({ params }: TransactionPageProps) {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const transaction = await prisma.transactionHistory.findUnique({
    where: { 
      id: params.id,
      userId: session.id, // Ensure the transaction belongs to the user
    },
  });

  if (!transaction) {
    redirect('/dashboard/history');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/history">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <p className="text-muted-foreground">
            Viewing details for transaction
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{transaction.title}</CardTitle>
          <CardDescription>
            Transaction ID: {transaction.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Amount</h3>
              <p className="text-2xl font-bold">${transaction.amount.toFixed(2)}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <p>
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
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Created On</h3>
              <p>
                {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p>
                {new Date(transaction.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}