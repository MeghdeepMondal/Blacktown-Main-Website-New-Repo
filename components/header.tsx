import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <header className="bg-black text-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            
            <div className="flex items-center">
              <Image
                src="/One Heart.png"
                alt="One Heart Blacktown Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
              <h1 className="ml-4 text-2xl font-bold">One Heart Blacktown</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="https://www.facebook.com/oneheartblacktown" 
                target="_blank" 
                className="hover:text-pink-500 transition-colors duration-300"
              >
                <Facebook size={24} />
              </Link>
              <Link 
                href="https://www.instagram.com/oneheartblacktown" 
                target="_blank" 
                className="hover:text-pink-500 transition-colors duration-300"
              >
                <Instagram size={24} />
              </Link>
            </div>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Members
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-pink-500 transition-colors duration-300 text-lg">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;