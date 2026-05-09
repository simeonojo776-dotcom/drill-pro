import { NextResponse } from 'next/server';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../packages/ui/src/firebase'; // Your exact path
import { Resend } from 'resend';

// Initialize the Email Bot using your API key from Vercel Environment Variables
const resend = new Resend(process.env.re_P9Tvgqz9_Py7ZFNeCn4xwdipPpzxQpkfr);

export async function POST(req) {
  // 1. Security Check
  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 2. Only do something if the payment was successful
    if (body.event === 'charge.success') {
      const email = body.data.customer.email;
      const amountPaid = body.data.amount / 100;

      // 3. Find the user in your database using their email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        
        // 4. Upgrade them in the database!
        await updateDoc(doc(db, "users", userDoc.id), {
          isPremium: true,
          accountTier: amountPaid >= 6000 ? "Yearly Elite" : "Monthly Pro",
          premiumSince: new Date().toISOString()
        });
        
        console.log(`🤖 DB: Successfully upgraded ${email}`);

        // 5. Fire off the professional Welcome Email!
        try {
          await resend.emails.send({
            from: 'Drill Pro <onboarding@resend.dev>', // Keep this until you buy a domain
            to: [email],
            subject: 'Drill Pro Premium Activated 🚀',
            html: `
              <div style="background-color: #020617; color: white; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 10px; border: 1px solid #1e293b;">
                <h1 style="color: #38bdf8; margin-bottom: 10px;">Payment Successful!</h1>
                <h2 style="color: #e2e8f0; margin-top: 0;">Welcome to Premium</h2>
                <p style="color: #94a3b8; line-height: 1.6;">Your candidate profile (${email}) has been successfully upgraded. You now have full access to all features.</p>
                <a href="https://drill-pro.vercel.app/dashboard" style="background-color: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 25px; font-weight: bold; letter-spacing: 1px;">ACCESS TERMINAL</a>
              </div>
            `,
          });
          console.log(`✉️ RESEND: Email sent to ${email}`);
        } catch (emailErr) {
          // If email fails, don't crash the webhook. The user still paid!
          console.error("Resend Error:", emailErr);
        }
      } else {
        console.log(`⚠️ BOT: Payment successful, but user ${email} not found in database.`);
      }
    }
    
    // Always tell Paystack "Message received!" so they don't keep trying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}