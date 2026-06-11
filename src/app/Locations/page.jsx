import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Global Service Areas | EyE PunE',
  description: 'EyE PunE provides elite digital marketing, AI automation, and web development services to top cities across the globe.',
};

const targetCities = [
    "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Kolkata", 
    "Ahmedabad", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", 
    "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", 
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", 
    "Ranchi", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", 
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi-Mumbai", 
    "Allahabad", "Howrah", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", 
    "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", 
    "Dubai", "Singapore", "London", "New-York", "Toronto", "Sydney"
].sort();

export default function LocationsDirectory() {
  return (
    <main className="min-h-screen pt-32 pb-20 relative bg-black">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-red-900/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold mb-6">
                <Globe className="w-4 h-4" /> Global Reach. Local Dominance.
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
                Our Service <span className="text-red-500">Locations</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
                While we are headquartered in Pune, India, we architect growth systems, AI automatons, and full-stack web applications for ambitious companies worldwide. Find your city below.
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {targetCities.map((city, idx) => (
                <Link key={idx} href={`/Locations/${city}`}>
                    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 hover:bg-white/[0.04] transition-all flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300 group-hover:text-white font-medium text-sm md:text-base">
                            {city.replace(/-/g, ' ')}
                        </span>
                        <MapPin className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                    </div>
                </Link>
            ))}
        </div>

        <div className="mt-24 text-center p-12 rounded-3xl bg-gradient-to-br from-red-950/30 to-black border border-red-900/30">
            <h2 className="text-2xl font-bold text-white mb-4">Don't see your city listed?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                We operate 100% remotely for international clients. Whether you're in a major metro or a remote startup hub, we can build your growth engine.
            </p>
            <Link href="/Contact">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-full">
                    Book a Global Strategy Call <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
