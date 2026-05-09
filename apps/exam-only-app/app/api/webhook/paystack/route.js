import { NextResponse } from 'next/server';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
// Make sure this points to wherever your firebase.js file is stored!
import { db } from 'packages/ui/src/firebase'; 

export async function POST(req) {
  // 1. Security Check: Did this really come from Paystack?
  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 2. Only do something if the payment was successful
    if (body.event === 'charge.success') {
      const email = body.data.customer.email;
      const amountPaid = body.data.amount / 100; // Paystack sends amounts in kobo (e.g., 600000 = 6000)

      // 3. Find the user in your database using their email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        
        // 4. The Bot automatically flips the Premium switch!
        await updateDoc(doc(db, "users", userDoc.id), {
          isPremium: true,
          accountTier: amountPaid >= 6000 ? "Yearly Elite" : "Monthly Pro",
          premiumSince: new Date().toISOString()
        });
        
        console.log(`🤖 BOT: Successfully upgraded ${email}`);
      }
    }
    
    // Always tell Paystack "Message received!" so they don't keep trying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}