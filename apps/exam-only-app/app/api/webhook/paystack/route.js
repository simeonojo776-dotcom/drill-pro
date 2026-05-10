import { NextResponse } from 'next/server';
import crypto from 'crypto'; // 👈 Added for security hash
import { doc, updateDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
// Verify this path is correct for your monorepo structure
import { db } from '../../../../../../packages/ui/src/firebase'; 
import { Resend } from 'resend';

export async function POST(req) {
  // 1. INITIALIZE RESEND
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("❌ CONFIG ERROR: RESEND_API_KEY is not defined in Vercel Environment Variables.");
    return NextResponse.json({ error: "Email configuration missing" }, { status: 200 });
  }

  const resend = new Resend(apiKey);

  // 2. PAYSTACK SECURITY CHECK
  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: "Unauthorized: No signature" }, { status: 401 });
  }

  try {
    // ⚠️ CRITICAL FIX: Must read as raw text to verify the cryptographic hash!
    const rawBody = await req.text();
    
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("❌ CONFIG ERROR: PAYSTACK_SECRET_KEY is missing.");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // Mathematically prove this request actually came from Paystack
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      console.error("❌ SECURITY ALERT: Fake webhook attempt blocked.");
      return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
    }

    // Now it's safe to parse the JSON
    const body = JSON.parse(rawBody);

    // 3. PROCESS SUCCESSFUL CHARGE
    if (body.event === 'charge.success') {
      const email = body.data.customer.email;
      const amountPaid = body.data.amount / 100; // Convert kobo to Naira

      // 4. FIND USER IN FIRESTORE
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);
        
        // 5. UPDATE PREMIUM STATUS
        await updateDoc(userRef, {
          isPremium: true,
          accountTier: amountPaid >= 6000 ? "Yearly Elite" : "Monthly Pro",
          premiumSince: new Date().toISOString(),
          lastPaymentReference: body.data.reference,
          // Added this so their in-app notification center gets updated too!
          notifications: arrayUnion({
            id: Date.now().toString(),
            title: "Premium Activated 🏆",
            message: `Your payment was verified. Welcome to Drill Pro!`,
            date: new Date().toISOString(),
            read: false
          })
        });
        
        console.log(`✅ DB UPGRADE: ${email} is now Premium.`);

        // 6. SEND WELCOME EMAIL VIA RESEND
        try {
          await resend.emails.send({
            from: 'Drill Pro <onboarding@resend.dev>', // Change to your verified domain later!
            to: [email],
            subject: 'Drill Pro Premium Activated 🚀',
            html: `
              <div style="background-color: #020617; color: white; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 12px; border: 1px solid #1e293b;">
                <h1 style="color: #38bdf8;">Access Granted</h1>
                <p style="font-size: 16px; color: #cbd5e1;">Your candidate profile (${email}) has been successfully upgraded to Premium.</p>
                <div style="margin: 30px 0;">
                  <a href="https://drill-pro.vercel.app/" style="background-color: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Launch Terminal</a>
                </div>
                <p style="font-size: 12px; color: #64748b;">If you didn't authorize this, please contact support.</p>
              </div>
            `,
          });
          console.log(`✉️ EMAIL SENT: ${email}`);
        } catch (emailErr) {
          console.error("✉️ EMAIL ERROR:", emailErr.message);
        }
      } else {
        console.warn(`⚠️ USER NOT FOUND: Payment received for ${email} but no DB record exists.`);
      }
    }
    
    // Always acknowledge receipt to Paystack
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err) {
    console.error("❌ WEBHOOK CRASH:", err.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}