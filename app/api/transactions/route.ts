import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, unauthenticatedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return unauthenticatedResponse();
    }
    
    const body = await request.json();
    const { title, amount, status } = body;
    
    // Validate input
    if (!title || amount === undefined || !status) {
      return NextResponse.json(
        { error: 'Title, amount, and status are required' },
        { status: 400 }
      );
    }
    
    // Create new transaction
    const transaction = await prisma.transactionHistory.create({
      data: {
        title,
        amount: parseFloat(amount),
        status,
        userId: session.id,
      },
    });
    
    return NextResponse.json(
      { message: 'Transaction created successfully', transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return unauthenticatedResponse();
    }
    
    // Get all transactions for the user
    const transactions = await prisma.transactionHistory.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Transaction retrieval error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}