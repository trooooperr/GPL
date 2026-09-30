"use client";

import { useState } from "react";
import { MapPin, Navigation, ExternalLink, Loader2 } from "lucide-react";

export default function VenueMap() {
  const [isLoading, setIsLoading] = useState(true);

  // Fast direct Google Maps destination URL
  const googleMapsDirectionsUrl = "https://www.google.com/maps/search/?api=1&query=Sambhaji+Maidan+Goregaon+East+Mumbai";
  
  // High-performance lightweight embed URL
  const mapEmbedUrl = "https://maps.google.com/maps?q=Sambhaji+Maidan,+Goregaon+East,+Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section id="location" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091e42] tracking-tight">
            Tournament Location
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            Sambhaji Maidan, Near Dindoshi, Goregaon East, Mumbai
          </p>
        </div>

        {/* Map Container with Quick Action Overlay and Fast Loader */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-[#e5e3df] h-[380px] sm:h-[450px]">
          
          {/* Fast Skeleton / Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs transition-opacity duration-300">
              <Loader2 className="w-8 h-8 text-[#059669] animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-600">Loading Sambhaji Maidan Location...</p>
            </div>
          )}

          {/* High-Performance Embedded Iframe */}
          <iframe
            title="Sambhaji Maidan GPL Venue Map"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="eager"
            onLoad={() => setIsLoading(false)}
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Floating Action Card in Corner */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-slate-900 truncate">Sambhaji Maidan</h4>
                <p className="text-[11px] text-slate-500 truncate">Goregaon East, Mumbai</p>
              </div>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
