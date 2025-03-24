"use client";
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Loader2, AlertCircle, ExternalLink, Calendar, Heart, MessageCircle } from 'lucide-react';
import { BackgroundShapes } from '../components/background-shapes';
import Image from 'next/image';

declare global {
  interface Window {
    FB?: any;
  }
}

type InstagramPost = {
  id: string
  caption: string
  media_type: string
  media_url: string
  permalink: string
  timestamp: string
}

export default function SocialMedia() {
  const [isLoadingFB, setIsLoadingFB] = useState(true);
  const [isLoadingIG, setIsLoadingIG] = useState(true);
  const [errorFB, setErrorFB] = useState<string | null>(null);
  const [errorIG, setErrorIG] = useState<string | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  const fetchInstagramPosts = async () => {
    try {
      const response = await fetch('/api/instagram-feed');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch Instagram posts: ${errorData.error}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }
      const data = await response.json();
      setInstagramPosts(data);
      setIsLoadingIG(false);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      setErrorIG(error.message || 'Failed to load Instagram feed. Please try again later.');
      setIsLoadingIG(false);
    }
  };

  useEffect(() => {
    const loadFacebookSDK = () => {
      try {
        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
        script.crossOrigin = "anonymous";
        script.nonce = "random_nonce";
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.FB) {
            window.FB.Event.subscribe('xfbml.render', () => {
              setIsLoadingFB(false);
            });
          }
        };
        script.onerror = () => {
          setErrorFB('Failed to load Facebook feed. Please try again later.');
          setIsLoadingFB(false);
        };

        document.body.appendChild(script);

        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.insertBefore(fbRoot, document.body.firstChild);

        setTimeout(() => {
          setIsLoadingFB(false);
        }, 5000);
      } catch (err) {
        setErrorFB('An error occurred while loading the Facebook feed.');
        setIsLoadingFB(false);
      }
    };

    loadFacebookSDK();
    fetchInstagramPosts();

    return () => {
      const fbRoot = document.getElementById('fb-root');
      if (fbRoot) fbRoot.remove();
      const fbScript = document.querySelector('script[src*="connect.facebook.net"]');
      if (fbScript) fbScript.remove();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="relative">
          <BackgroundShapes />
          
          {/* Header Section */}
          <section className="relative pt-16 pb-8 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-4">
                  Connect With Us
                </h1>
                <p className="text-lg md:text-xl text-pink-600 max-w-2xl mx-auto">
                  Stay updated with One Heart Blacktown's latest news, events, and community activities through our social media channels.
                </p>
              </div>

              {/* Social Media Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Facebook className="h-6 w-6 text-blue-600" />
                      Facebook
                    </CardTitle>
                    <CardDescription>
                      Follow our daily updates and community stories
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <a 
                      href="https://www.facebook.com/oneheartblacktown/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full" variant="outline">
                        Follow Us
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="h-6 w-6 text-pink-600" />
                      Instagram
                    </CardTitle>
                    <CardDescription>
                      See our visual stories and event highlights
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <a 
                      href="https://www.instagram.com/oneheartblacktown/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full" variant="outline">
                        Follow Us
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Twitter className="h-6 w-6 text-blue-400" />
                      Twitter
                    </CardTitle>
                    <CardDescription>
                      Get real-time updates and announcements
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Coming Soon
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>

          {/* Social Media Feeds Section */}
          <section className="px-4 pb-16">
            <div className="container mx-auto max-w-7xl">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Facebook Feed */}
                <Card className="bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-white">
                    <CardTitle className="flex items-center gap-2 text-pink-800 text-2xl">
                      <Facebook className="h-7 w-7" />
                      Facebook Feed
                    </CardTitle>
                    <CardDescription className="text-base">
                      See our latest posts, events, and community engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 min-h-[600px] relative">
                    {isLoadingFB && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-2" />
                          <p className="text-pink-800">Loading Facebook feed...</p>
                        </div>
                      </div>
                    )}
                    
                    {errorFB && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-600 mb-4">{errorFB}</p>
                          <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <div
                        className="fb-page w-full"
                        data-href="https://www.facebook.com/oneheartblacktown/"
                        data-tabs="timeline,events,messages"
                        data-width="500"
                        data-height="800"
                        data-small-header="false"
                        data-adapt-container-width="true"
                        data-hide-cover="false"
                        data-show-facepile="true"
                        data-show-cover="true"
                      >
                        <blockquote
                          cite="https://www.facebook.com/oneheartblacktown/"
                          className="fb-xfbml-parse-ignore"
                        >
                          <a href="https://www.facebook.com/oneheartblacktown/">
                            One Heart Blacktown
                          </a>
                        </blockquote>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instagram Feed */}
                <Card className="bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-white">
                    <CardTitle className="flex items-center gap-2 text-pink-800 text-2xl">
                      <Instagram className="h-7 w-7" />
                      Instagram Feed
                    </CardTitle>
                    <CardDescription className="text-base">
                      See our visual stories and event highlights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 min-h-[600px] relative">
                    {isLoadingIG && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-2" />
                          <p className="text-pink-800">Loading Instagram feed...</p>
                        </div>
                      </div>
                    )}
                    
                    {errorIG && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-600 mb-4">{errorIG}</p>
                          <Button 
                            onClick={() => {
                              setIsLoadingIG(true);
                              setErrorIG(null);
                              fetchInstagramPosts();
                            }}
                            variant="outline"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                      {instagramPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {post.media_type === 'IMAGE' && (
                              <div className="relative aspect-square">
                                <Image
                                  src={post.media_url || "/placeholder.svg"}
                                  alt={post.caption || 'Instagram post'}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                            )}
                            {post.media_type === 'VIDEO' && (
                              <video
                                src={post.media_url}
                                controls
                                className="w-full aspect-square object-cover"
                              />
                            )}
                          </CardContent>
                          <CardFooter className="flex flex-col items-start gap-2">
                            <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.timestamp)}
                              </span>
                              <a
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-pink-600 hover:text-pink-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View on Instagram
                              </a>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}