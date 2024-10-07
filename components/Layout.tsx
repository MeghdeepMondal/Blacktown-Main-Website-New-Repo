import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black text-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <h1 className="ml-4 text-2xl font-bold">One Heart Blacktown</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="text-white hover:text-pink-500">Home</Link></li>
              <li><Link href="/opportunities" className="text-white hover:text-pink-500">Opportunities</Link></li>
              <li><Link href="/blog" className="text-white hover:text-pink-500">Blog</Link></li>
              <li><Link href="/events" className="text-white hover:text-pink-500">Events</Link></li>
              <li><Link href="/about" className="text-white hover:text-pink-500">About</Link></li>
              <li><Link href="/contact" className="text-white hover:text-pink-500">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow">        
        {children}        
      </main>
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 One Heart Blacktown. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}