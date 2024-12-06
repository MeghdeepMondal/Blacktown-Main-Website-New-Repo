import Layout from '../components/Layout';
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Users, Target, Lightbulb, Squirrel, Eye } from 'lucide-react';

// Reuse the background components from homepage
const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.2)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M0,0 Q50,100 100,0 V100 H0 Z" fill="url(#grad1)" />
      <circle cx="80%" cy="60%" r="100" fill="rgba(255,192,203,0.2)" />
    </svg>
  </div>
);

const DecorativeShapes = () => (
  <>
    <motion.div
      className="absolute top-10 right-10 opacity-20"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50">
        <path
          d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20L25 0Z"
          fill="rgba(255,105,180,0.5)"
        />
      </svg>
    </motion.div>
  </>
);

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
        <main className="py-12">
          <div className="container mx-auto px-4">
            <motion.h1 
              className="text-4xl font-bold mb-12 text-center text-pink-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About One Heart Blacktown
            </motion.h1>
            
            <section className="mb-16 relative">
              <BackgroundShapes />
              <DecorativeShapes />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl text-pink-800">
                      <Squirrel className="mr-3 text-pink-500 h-8 w-8" />
                      Our Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">
                      In a densely populated and diverse area of western Sydney, many churches are only involved in
                      token or historical ways of engaging with the community. A new partnership between local church leaders has
                      established a community hub in the heart of Blacktown. The hub&apos;s purpose is to motivate &quot;The
                      Church&quot; of Blacktown to be immersed in the local community and to see gospel transformation in
                      people&apos;s lives in the name of Jesus.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <section className="mb-16 relative">
              <BackgroundShapes />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl text-pink-800">
                      <Eye className="mr-3 text-pink-500 h-8 w-8" />
                      Our Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">
                      God&apos;s will to be done in Blacktown as it is in heaven: suburban transformation through
                      restoration and healing of the city aligning with God&apos;s desires and heart for its people.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            <section className="mb-16 relative">
              <BackgroundShapes />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h2 className="text-2xl font-semibold mb-8 text-center text-pink-800">Our Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <HeartHandshake className="h-8 w-8" />,
                      title: "Prayer",
                      description: "Dependence on God's enabling power"
                    },
                    {
                      icon: <Users className="h-8 w-8" />,
                      title: "Unity",
                      description: "Embracing the diversity of the one body, the bride of Christ"
                    },
                    {
                      icon: <Target className="h-8 w-8" />,
                      title: "Mission",
                      description: "Action orientated through obedience to Jesus and empowered by his Spirit"
                    }
                  ].map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                    >
                      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                          <CardTitle className="flex items-center text-pink-800">
                            <span className="text-pink-500 mr-3">{value.icon}</span>
                            {value.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{value.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section className="relative">
              <BackgroundShapes />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl text-pink-800">
                      <Lightbulb className="mr-3 text-pink-500 h-8 w-8" />
                      Our Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-gray-700">
                      Create space (physical, social, relational, civil space) and opportunities for &quot;champions&quot;
                      who align with the vision, mission, and values, and develop teams who serve the city.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}