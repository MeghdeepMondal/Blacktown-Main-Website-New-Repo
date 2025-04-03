import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export interface AuthenticatedRequest extends NextApiRequest {
  superadmin?: {
    username: string;
    role: string;
  }
}

export function superadminAuthMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' })
      }
      
      const token = authHeader.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' })
      }
      
      // Verify token
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string }
        
        // Check if user is a superadmin
        if (decoded.role !== 'superadmin') {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
        }
        
        // Attach user info to request
        req.superadmin = decoded
        
        // Call the original handler
        return handler(req, res)
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' })
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}