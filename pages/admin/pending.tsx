import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AdminPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signup Request Being Reviewed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Thank you for your patience. Your signup request is currently being reviewed by our team.
            We&apos;ll notify you once your account has been approved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPendingPage