import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
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

  const { username } = req.body

  if (!username) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const email = process.env.SUPERADMIN_EMAIL || 'oneheartblacktown@gmail.com'
    if (!email) {
      console.error('SUPERADMIN_EMAIL not set in environment.')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    if (username !== email) {
      // Still return success to prevent email guessing
      return res.status(200).json({ message: 'If that user exists, an OTP has been sent.' })
    }

    const plainOTP = generateOTP()
    const hashedOTP = await bcrypt.hash(plainOTP, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Reuse the passwordresetotp table with a special superadmin identifier.
    // We'll use 'superadmin' as the "email" column value for the OTP entry to avoid conflicts with admins.
    await prisma.passwordresetotp.upsert({
      where: { email: 'superadmin' },
      update: { otp: hashedOTP, expiresAt, createdAt: new Date() },
      create: { email: 'superadmin', otp: hashedOTP, expiresAt },
    })

    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'One Heart Blacktown – Superadmin Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff9fb; border: 1px solid #fbc8d9; border-radius: 12px;">
          <h2 style="color: #c0395c; margin-bottom: 8px;">Superadmin Password Reset</h2>
          <p style="color: #555; font-size: 15px;">You requested a password reset for the One Heart Blacktown superadmin account.</p>
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

    return res.status(200).json({ message: 'If that user exists, an OTP has been sent.' })
  } catch (error) {
    console.error('Superadmin forgot password error:', error)
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
  }
}
