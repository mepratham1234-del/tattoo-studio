import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { designId, paymentMode, amount, titles, imageUrls } = body;

    // Convert the single string "1-2-3" back into an array for the scanner
    const designIdsArray = typeof designId === 'string' ? designId.split('-') : [designId];
    const titlesArray = typeof titles === 'string' ? titles.split(', ') : [titles];
    const imagesArray = typeof imageUrls === 'string' ? imageUrls.split(',') : [imageUrls];

    const docRef = await addDoc(collection(db, "tokens"), {
      designIds: designIdsArray,
      titles: titlesArray,
      imageUrls: imagesArray,
      paymentMode,
      amount,
      status: 'pending_payment',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ tokenId: docRef.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}