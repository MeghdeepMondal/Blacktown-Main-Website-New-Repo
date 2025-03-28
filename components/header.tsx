import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <header className="bg-black text-white shadow h-22">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-6">
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
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Members
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-white hover:text-pink-500 transition-colors duration-300">
                Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-pink-500 transition-colors duration-300">
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