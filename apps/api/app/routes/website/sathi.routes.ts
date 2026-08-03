import { Router, Request, Response } from 'express';
import prisma from '../../core/database';
import { createTransporter, isEmailConfigured } from './utils/mailer';

const router = Router();

/**
 * POST /api/website/saathi-enrollment
 * Handles Saathi volunteer applications submitted via the website.
 * Saves to DB and sends an internal notification email.
 */
router.post('/saathi-enrollment', async (req: Request, res: Response) => {
  console.log('📩 [Saathi Enrollment] Received payload:', req.body);

  try {
    const { firstName, lastName, email, phone, gender, state, city, pincode, area, whyJoin, age } = req.body;

    if (!firstName || !phone || !state || !city) {
      return res.status(400).json({
        success: false,
        message: 'First Name, phone, state, and city are required',
      });
    }

    const name = `${firstName} ${lastName || ''}`.trim();

    // 1. Save volunteer application to database
    try {
      await (prisma as any).volunteer.create({
        data: {
          name,
          phone,
          email: email || null,
          gender: gender || null,
          state,
          city,
          pincode: pincode || null,
          streetArea: area || null,
          whyJoin: whyJoin || null,
          age: age ? parseInt(age, 10) : null,
          applicationStatus: 'SUBMITTED',
        },
      });
      console.log(`✅ [Saathi Enrollment] Saved to database: ${name}`);
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'This phone number or email is already registered.',
        });
      }
      console.error('⚠️ [Saathi Enrollment] DB insert error:', dbErr.message);
      throw dbErr;
    }

    // 2. Send internal notification email to team
    const recipientEmail = process.env.WAITLIST_RECIPIENT_EMAIL || 'info@maihoonna.com';
    const mailOptions = {
      from: `"MaiHoonna Website" <${process.env.EMAIL_USER || 'info@maihoonna.com'}>`,
      to: recipientEmail,
      subject: `New Saathi Application - ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1F2937; line-height: 1.7;">
          <div style="background: linear-gradient(135deg, #10B981, #34D399); padding: 24px 30px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
              🤝 New Saathi Application
            </h2>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #F3F4F6; border-top: none;">
            <p style="font-size: 15px; color: #374151; margin-top: 0;">Hello Team,</p>
            <p style="font-size: 15px; color: #374151;">
              A new user has submitted a Saathi Volunteer application via the website.
            </p>
            <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 24px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Name:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${name}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Mobile:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${phone}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Email:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${email || 'N/A'}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Location:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${city}, ${state}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Why Join:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${whyJoin || 'N/A'}</td></tr>
              </table>
            </div>
          </div>
        </div>
      `,
    };

    if (isEmailConfigured()) {
      const transporter = createTransporter();
      transporter.sendMail(mailOptions).catch((e) =>
        console.error('⚠️ Saathi notification email failed:', e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error: any) {
    console.error('❌ [Saathi Enrollment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

export default router;
