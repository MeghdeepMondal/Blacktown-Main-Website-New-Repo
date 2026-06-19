import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' })
  }

  try {
    // Re-verify OTP to prevent skipping the verification step
    const record = await prisma.passwordresetotp.findUnique({ where: { email } })

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please restart the reset process.' })
    }

    if (new Date() > record.expiresAt) {
      await prisma.passwordresetotp.delete({ where: { email } })
      return res.status(400).json({ message: 'OTP has expired. Please restart the reset process.' })
    }

    const isValid = await bcrypt.compare(otp, record.otp)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please restart the reset process.' })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the admin's password
    await prisma.admins.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Clean up the used OTP record
    await prisma.passwordresetotp.delete({ where: { email } })

    return res.status(200).json({ message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ message: 'Error resetting password. Please try again.' })
  }
}
