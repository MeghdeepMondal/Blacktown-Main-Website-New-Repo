import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type Frequency = 'once-off' | 'weekly' | 'monthly';

interface Opportunity {
  id: number;
  name: string;
  logo: string;
  organizer: string;
  location: string;
  frequency: Frequency;
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    name: "Community Clean-up",
    logo: "/placeholder.svg?height=100&width=100&text=Clean-up",
    organizer: "Green Earth",
    location: "Blacktown Park",
    frequency: "monthly"
  },
  {
    id: 2,
    name: "Youth Mentoring Program",
    logo: "/placeholder.svg?height=100&width=100&text=Mentoring",
    organizer: "Future Leaders",
    location: "Blacktown Community Center",
    frequency: "weekly"
  },
  {
    id: 3,
    name: "Charity Fun Run",
    logo: "/placeholder.svg?height=100&width=100&text=Fun+Run",
    organizer: "Blacktown Runners",
    location: "Blacktown Showground",
    frequency: "once-off"
  },
  // Add more opportunities as needed
];

export default function OpportunitiesPage() {
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filterFrequency, setFilterFrequency] = useState<Frequency | 'all'>('all');
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>(opportunities);

  useEffect(() => {
    const filtered = opportunities.filter(opportunity => 
      opportunity.name.toLowerCase().includes(searchName.toLowerCase()) &&
      opportunity.location.toLowerCase().includes(searchLocation.toLowerCase()) &&
      (filterFrequency === 'all' || opportunity.frequency === filterFrequency)
    );
    setFilteredOpportunities(filtered);
  }, [searchName, searchLocation, filterFrequency]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Opportunities</h1>
        
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by event name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="Search by location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <select
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value as Frequency | 'all')}
            className="w-full md:w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All frequencies</option>
            <option value="once-off">Once-off</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="bg-white shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Image
                    src={opportunity.logo}
                    alt={`${opportunity.name} logo`}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-500 capitalize">{opportunity.frequency}</span>
                </div>
                <CardTitle className="text-xl font-bold mt-2">{opportunity.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2"><strong>Organizer:</strong> {opportunity.organizer}</p>
                <p className="text-gray-600 mb-4"><strong>Location:</strong> {opportunity.location}</p>
                <Button className="w-full bg-pink-500 text-white hover:bg-pink-600">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No opportunities found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}