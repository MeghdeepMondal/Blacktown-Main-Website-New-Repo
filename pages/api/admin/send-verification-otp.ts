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

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    // Check if this email is already a registered admin
    const existingAdmin = await prisma.admins.findUnique({ where: { email } })
    if (existingAdmin) {
      return res.status(409).json({ message: 'An admin account with this email already exists.' })
    }

    // Check if there is already a pending signup request with this email
    const existingRequest = await prisma.adminrequests.findUnique({ where: { email } })
    if (existingRequest) {
      return res.status(409).json({ message: 'A signup request with this email is already pending approval.' })
    }

    // Generate + hash OTP
    const plainOTP = generateOTP()
    const hashedOTP = await bcrypt.hash(plainOTP, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Upsert into the shared passwordresetotp table (reusing the same infrastructure)
    await prisma.passwordresetotp.upsert({
      where: { email },
      update: { otp: hashedOTP, expiresAt, createdAt: new Date() },
      create: { email, otp: hashedOTP, expiresAt },
    })

    // Send verification email
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'One Heart Blacktown – Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff9fb; border: 1px solid #fbc8d9; border-radius: 12px;">
          <h2 style="color: #c0395c; margin-bottom: 8px;">Verify Your Email Address</h2>
          <p style="color: #555; font-size: 15px;">You are signing up for a One Heart Blacktown admin account. Please verify your email address using the OTP below.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #c0395c; background: #fde8ef; padding: 16px 32px; border-radius: 8px;">
              ${plainOTP}
            </span>
          </div>
          <p style="color: #888; font-size: 13px;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #fbc8d9; margin: 24px 0;" />
          <p style="color: #bbb; font-size: 12px;">One Heart Blacktown Admin Portal</p>
        </div>
      `,
    })

    return res.status(200).json({ message: 'Verification OTP sent. Please check your inbox.' })
  } catch (error) {
    console.error('Send verification OTP error:', error)
    return res.status(500).json({ message: 'Failed to send verification OTP. Please try again.' })
  }
}
