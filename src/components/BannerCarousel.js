"use client";

export default function BannerCarousel() {
  return (
    <section className="relative w-full bg-white overflow-hidden select-none m-0 p-0 border-0">
      <div className="w-full max-w-[3840px] mx-auto flex items-center justify-center m-0 p-0">
        <img
          src="/images/gpl-banner.jpg"
          alt="GPL Season 4 - The Biggest Cricket Festival - Radhe Radhe Chashak"
          className="w-full h-auto block object-contain object-center m-0 p-0"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  );
}
