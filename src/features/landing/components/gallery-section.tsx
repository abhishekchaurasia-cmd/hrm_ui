'use client';

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Gift,
  PartyPopper,
  Trophy,
  Users,
  Heart,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GallerySlide {
  id: string;
  src: string | null;
  alt: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

/**
 * To add images from Google Drive:
 * 1. Upload your image to the shared Drive folder
 * 2. Right-click the file -> "Get link" -> copy the link
 * 3. Extract the file ID from the URL (the part between /d/ and /view)
 * 4. Use this format: https://drive.google.com/uc?export=view&id=YOUR_FILE_ID
 *
 * You can also use local images from public/images/landing/ if preferred.
 */
function driveUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

const slides: GallerySlide[] = [
  {
    id: 'celebration',
    src: null,
    alt: 'Team celebration at CopanDigital',
    icon: PartyPopper,
    label: 'Celebrations',
    description: 'Celebrating wins together as one team.',
  },
  {
    id: 'teamwork',
    src: driveUrl('1QvViaJh5RPdko48UOSYHKEP-SA7cJytX'),
    alt: 'Team collaboration session',
    icon: Users,
    label: 'Team Spirit',
    description: 'Collaboration that drives us forward.',
  },
  {
    id: 'awards',
    src: null,
    alt: 'Award ceremony at CopanDigital',
    icon: Trophy,
    label: 'Achievements',
    description: 'Recognizing excellence and hard work.',
  },
  {
    id: 'events',
    src: null,
    alt: 'Company event and fun activities',
    icon: Gift,
    label: 'Company Events',
    description: 'Fun moments that bring us closer.',
  },
  {
    id: 'culture',
    src: null,
    alt: 'Our culture and values',
    icon: Heart,
    label: 'Our Culture',
    description: 'Values that define who we are.',
  },
  {
    id: 'moments',
    src: null,
    alt: 'Memorable moments at CopanDigital',
    icon: Camera,
    label: 'Moments',
    description: 'Snapshots from our journey together.',
  },
];

const gradients: Record<string, string> = {
  celebration: 'from-orange-500 via-amber-500 to-yellow-500',
  teamwork: 'from-blue-500 via-cyan-500 to-teal-500',
  awards: 'from-amber-500 via-orange-500 to-red-500',
  events: 'from-violet-500 via-purple-500 to-fuchsia-500',
  culture: 'from-rose-500 via-pink-500 to-red-500',
  moments: 'from-emerald-500 via-teal-500 to-cyan-500',
};

const AUTOPLAY_MS = 5000;

function SlideContent({ slide }: { slide: GallerySlide }) {
  const Icon = slide.icon;
  const gradient = gradients[slide.id] ?? 'from-orange-500 to-amber-500';

  const isExternal = slide.src?.startsWith('http');

  if (slide.src) {
    return (
      <div className="relative size-full">
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
          unoptimized={isExternal}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end p-6 sm:p-10">
          <div className="flex items-center gap-4 text-white">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Icon className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold sm:text-2xl">{slide.label}</h3>
              <p className="mt-1 text-sm text-white/80">{slide.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative size-full">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={`carousel-dots-${slide.id}`}
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#carousel-dots-${slide.id})`}
          />
        </svg>
      </div>

      <div className="relative flex size-full flex-col items-center justify-center gap-4 text-white">
        <div className="flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Icon className="size-10" />
        </div>
        <h3 className="text-2xl font-bold sm:text-3xl">{slide.label}</h3>
        <p className="text-sm text-white/80">{slide.description}</p>
        <span className="mt-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
          Add your photo here
        </span>
      </div>
    </div>
  );
}

export function GallerySection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused]);

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Life at CopanDigital
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Celebrations, milestones, and the moments that make our team
            special.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative mt-14 overflow-hidden rounded-2xl shadow-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides track */}
          <div className="relative h-[320px] sm:h-[400px] lg:h-[480px]">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  'absolute inset-0 transition-all duration-700 ease-in-out',
                  i === current
                    ? 'z-10 scale-100 opacity-100'
                    : 'z-0 scale-105 opacity-0'
                )}
                aria-hidden={i !== current}
              >
                <SlideContent slide={slide} />
              </div>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute top-1/2 left-3 z-20 size-10 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute top-1/2 right-3 z-20 size-10 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </Button>

          {/* Dot indicators */}
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${slide.label}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/10">
            <div
              className="h-full bg-white/60 transition-all ease-linear"
              style={{
                width: paused ? `${((current + 1) / total) * 100}%` : '100%',
                transitionDuration: paused ? '300ms' : `${AUTOPLAY_MS}ms`,
              }}
              key={current}
            />
          </div>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Photos coming soon — share your favorite CopanDigital moments!
        </p>
      </div>
    </section>
  );
}
