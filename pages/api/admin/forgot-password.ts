import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Generate a random 6-digit OTP string
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create a Nodemailer transporter from env variables
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    // Check if admin exists — but always return 200 to avoid email enumeration
    const admin = await prisma.admins.findUnique({ where: { email } })

    if (!admin) {
      // Still return success so attackers can't enumerate valid emails
      return res.status(200).json({ message: 'If that email is registered, an OTP has been sent.' })
    }

    // Generate a plaintext OTP and hash it for storage
    const plainOTP = generateOTP()
    const hashedOTP = await bcrypt.hash(plainOTP, 10)

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Upsert the OTP record (one per email)
    await prisma.passwordresetotp.upsert({
      where: { email },
      update: { otp: hashedOTP, expiresAt, createdAt: new Date() },
      create: { email, otp: hashedOTP, expiresAt },
    })

    // Send OTP email
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'One Heart Blacktown – Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff9fb; border: 1px solid #fbc8d9; border-radius: 12px;">
          <h2 style="color: #c0395c; margin-bottom: 8px;">Password Reset Request</h2>
          <p style="color: #555; font-size: 15px;">You requested a password reset for your One Heart Blacktown admin account.</p>
          <p style="color: #555; font-size: 15px;">Your one-time password (OTP) is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #c0395c; background: #fde8ef; padding: 16px 32px; border-radius: 8px;">
              ${plainOTP}
            </span>
          </div>
          <p style="color: #888; font-size: 13px;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email. Your password will not be changed.</p>
          <hr style="border: none; border-top: 1px solid #fbc8d9; margin: 24px 0;" />
          <p style="color: #bbb; font-size: 12px;">One Heart Blacktown Admin Portal</p>
        </div>
      `,
    })

    return res.status(200).json({ message: 'If that email is registered, an OTP has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
  }
}
