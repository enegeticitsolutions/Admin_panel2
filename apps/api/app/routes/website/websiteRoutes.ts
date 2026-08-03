import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../../core/database';

const router = Router();

// Create Zoho Mail transporter for website lead notifications
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtppro.zoho.in',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * POST /api/website/submit-form
 * Handles website lead signup, saves to DB via @maihoonna/database, and dispatches Zoho emails.
 */
router.post('/submit-form', async (req: Request, res: Response) => {
  console.log('📩 [Website Lead] Received payload:', req.body);

  try {
    const { name, phone, pinCode, email } = req.body;

    if (!name || !phone || !pinCode || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, pin code and email are required',
      });
    }

    const recipientEmail = process.env.WAITLIST_RECIPIENT_EMAIL || 'info@maihoonna.com';

    const submittedOn =
      new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';

    // 1. Save lead to database using unified @maihoonna/database Prisma Client
    try {
      await (prisma as any).marketingLead.create({
        data: {
          name,
          phone,
          pincode: pinCode,
          email,
          source: 'website',
          status: 'new',
        },
      });
      console.log(`✅ [Website Lead] Saved to database: ${name}`);
    } catch (dbErr: any) {
      console.error('⚠️ [Website Lead] DB insert warning:', dbErr.message);
    }

    // 2. Dispatch internal lead notification email via Zoho Mail
    const mailOptions = {
      from: `"MaiHoonna Website" <${process.env.EMAIL_USER || 'info@maihoonna.com'}>`,
      to: recipientEmail,
      subject: `New MaiHoonna Waitlist Lead - ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1F2937; line-height: 1.7;">
          <div style="background: linear-gradient(135deg, #F97316, #FB923C); padding: 24px 30px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
              🎉 New Waitlist Signup
            </h2>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #F3F4F6; border-top: none;">
            <p style="font-size: 15px; color: #374151; margin-top: 0;">Hello Team,</p>
            <p style="font-size: 15px; color: #374151;">
              A new user has successfully joined the <strong>MaiHoonna</strong> waitlist.
            </p>
            <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 10px; padding: 24px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Full Name:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${name}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Mobile:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${phone}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Email:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${email}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Pin Code:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${pinCode}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Submitted On:</td><td style="padding: 6px 0; font-size: 15px; color: #1F2937; font-weight: 500;">${submittedOn}</td></tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #6B7280;">MaiHoonna Website Lead Notification</p>
          </div>
        </div>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`📧 [Website Lead] Notification email sent to ${recipientEmail}`);

      // Send confirmation email to user
      const confirmationMail = {
        from: `"MaiHoonna" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to the MaiHoonna Waitlist! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #F97316;">Hi ${name},</h2>
            <p>Thank you for joining the MaiHoonna waitlist!</p>
            <p>We will notify you as soon as MaiHoonna launches in your area.</p>
            <br>
            <p>Warm regards,<br><strong>Team MaiHoonna</strong></p>
          </div>
        `,
      };
      transporter.sendMail(confirmationMail).catch((e) => console.error('⚠️ User confirmation email failed:', e.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Lead submitted successfully',
    });
  } catch (error: any) {
    console.error('❌ [Website Lead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

/**
 * GET /api/website/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'Website API running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/website/content/sathi
 * Fetch dynamic content for the Saathi page
 */
router.get('/content/sathi', async (_req: Request, res: Response) => {
  try {
    const content = await (prisma as any).websiteContent.findUnique({
      where: { pageKey: 'sathi_page' },
    });

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Also fetch 3 active volunteers for "Meet our Saathis"
    const saathis = await (prisma as any).volunteer.findMany({
      where: { applicationStatus: 'APPROVED' },
      take: 3,
      select: {
        name: true,
        city: true,
        state: true,
        totalCreditHours: true,
        profilePhoto: true,
      },
    });

    // Fetch dynamic aggregate stats for the hero section
    const volunteerStats = await (prisma as any).volunteer.aggregate({
      where: { applicationStatus: 'APPROVED' },
      _count: true,
      _sum: {
        totalCreditHours: true,
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        content: content.content,
        saathis,
        liveStats: {
          activeCount: volunteerStats._count || 0,
          totalHours: volunteerStats._sum.totalCreditHours || 0
        }
      },
    });
  } catch (error: any) {
    console.error('❌ [Website Content Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching content.',
    });
  }
});

/**
 * POST /api/website/saathi-enrollment
 * Handles Saathi lead signup from website
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

    // Dispatch internal notification via Zoho Mail
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

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtppro.zoho.in',
        port: parseInt(process.env.EMAIL_PORT || '465', 10),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      transporter.sendMail(mailOptions).catch(e => console.error('⚠️ Notification email failed:', e.message));
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
