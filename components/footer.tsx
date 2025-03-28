import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Logo and Name */}
          <div className="flex flex-col items-center">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="mt-3 text-lg font-semibold">One Heart Blacktown</span>
          </div>

          {/* Copyright and Address */}
          <div className="text-center">
            <p className="mb-2">&copy; 2024 One Heart Blacktown. All rights reserved.</p>
            <div className="flex items-center justify-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-sm">
                Wotso, Westpoint Shopping Centre, Level 4, Shop 4023/17 Patrick St, 
                Blacktown NSW 2148, Australia
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;