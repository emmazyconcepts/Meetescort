// src/app/api/nowpayments/webhook/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const payload = await request.json();
    console.log('NowPayments Webhook Received:', JSON.stringify(payload, null, 2));

    const { payment_id, payment_status, pay_amount, order_id } = payload;

    // Find deposit by order_id or payment_id
    let depositsQuery;
    
    if (order_id) {
      depositsQuery = query(collection(db, 'deposits'), where('orderId', '==', order_id));
    } else {
      depositsQuery = query(collection(db, 'deposits'), where('nowpaymentsId', '==', payment_id));
    }
    
    const snapshot = await getDocs(depositsQuery);
    
    if (snapshot.empty) {
      console.log('Deposit not found for:', order_id || payment_id);
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const depositDoc = snapshot.docs[0];
    const depositData = depositDoc.data();

    // Update deposit status
    await updateDoc(depositDoc.ref, {
      status: mapPaymentStatus(payment_status),
      updatedAt: new Date()
    });

    // If payment is confirmed, add funds to wallet
    if (payment_status === 'confirmed' || payment_status === 'finished') {
      await confirmDeposit(depositDoc.id, depositData);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapPaymentStatus(nowpaymentsStatus) {
  const statusMap = {
    'waiting': 'pending',
    'confirming': 'confirming',
    'confirmed': 'confirmed',
    'finished': 'completed',
    'failed': 'failed',
    'expired': 'expired'
  };
  return statusMap[nowpaymentsStatus] || 'unknown';
}

async function confirmDeposit(depositId, depositData) {
  // Update deposit as confirmed
  await updateDoc(doc(db, 'deposits', depositId), {
    status: 'confirmed',
    confirmedAt: new Date()
  });

  // Add funds to user's wallet
  const walletRef = doc(db, 'wallets', depositData.userId);
  
  try {
    const walletDoc = await getDoc(walletRef);
    const currentBalance = walletDoc.exists() ? walletDoc.data().balance : 0;
    const totalDeposited = walletDoc.exists() ? walletDoc.data().totalDeposited : 0;

    await updateDoc(walletRef, {
      balance: currentBalance + depositData.amountUSD,
      totalDeposited: totalDeposited + depositData.amountUSD,
      updatedAt: new Date()
    });

    console.log(`✅ Deposit confirmed: $${depositData.amountUSD} for user ${depositData.userId}`);
  } catch (error) {
    console.error('Error updating wallet:', error);
    // Create wallet if it doesn't exist
    await setDoc(walletRef, {
      userId: depositData.userId,
      balance: depositData.amountUSD,
      totalDeposited: depositData.amountUSD,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}