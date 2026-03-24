'use client';

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Gift,
  GraduationCap,
  Handshake,
  Heart,
  Laugh,
  Music,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  Users,
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
 * 2. Right-click the file -> Share -> "Anyone with the link" (Viewer)
 * 3. Copy the link and extract the file ID (the part between /d/ and /view)
 * 4. Pass the file ID to driveUrl() below
 *
 * You can also use local images from public/images/landing/ if preferred.
 */
function driveUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

const slides: GallerySlide[] = [
  {
    id: 'celebration',
    src: driveUrl('1J2lBYvfL7cqCpPKm1B-jTEa4L14_FTtH'),
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
    src: driveUrl('13WBH-OLSkmC8uvffA_eCK7tTZxIwGKek'),
    alt: 'Award ceremony at CopanDigital',
    icon: Trophy,
    label: 'Achievements',
    description: 'Recognizing excellence and hard work.',
  },
  {
    id: 'events',
    src: driveUrl('1w4uHnu5CY1Y_U8Xud_CXaIPAVJi1itN3'),
    alt: 'Company event and fun activities',
    icon: Gift,
    label: 'Company Events',
    description: 'Fun moments that bring us closer.',
  },
  {
    id: 'culture',
    src: driveUrl('1e92LEg20MLYiP2keUJ62ueKhJMWK0tNA'),
    alt: 'Our culture and values at CopanDigital',
    icon: Heart,
    label: 'Our Culture',
    description: 'Values that define who we are.',
  },
  {
    id: 'together',
    src: driveUrl('1LWgKGpAw5K3jV7eMU7gXbFfGuWGd95nE'),
    alt: 'Team bonding at CopanDigital',
    icon: Handshake,
    label: 'Better Together',
    description: 'Stronger connections, stronger team.',
  },
  {
    id: 'fun',
    src: driveUrl('1tZ4dXoarvgQfucXV9KHIzirw8u-5PCoT'),
    alt: 'Fun moments at CopanDigital',
    icon: Laugh,
    label: 'Fun at Work',
    description: 'Because work should be enjoyable too.',
  },
  {
    id: 'vibes',
    src: driveUrl('1v8q1UZFplagZgHk2az0vGsLsdWn_9v9L'),
    alt: 'Good vibes at CopanDigital',
    icon: Music,
    label: 'Good Vibes',
    description: 'Energy that keeps us going.',
  },
  {
    id: 'growth',
    src: driveUrl('1tZMTuM009MIY2AN2-5qB7BukmFoQ638x'),
    alt: 'Learning and growth at CopanDigital',
    icon: GraduationCap,
    label: 'Growth',
    description: 'Always learning, always growing.',
  },
  {
    id: 'highlights',
    src: driveUrl('15sGwKmO4gi-PyTGp7-phm8gwcm6ImeTL'),
    alt: 'Highlights from CopanDigital',
    icon: Star,
    label: 'Highlights',
    description: 'The best moments captured forever.',
  },
  {
    id: 'spark',
    src: driveUrl('1PH1b18AP2bLjX_11XJuv-dNz2xGwq_9T'),
    alt: 'Sparking creativity at CopanDigital',
    icon: Sparkles,
    label: 'Spark',
    description: 'Where creativity meets passion.',
  },
  {
    id: 'moments',
    src: driveUrl('1OrW9zQpCKQtPQ14-ZTwVN_EBNcLvsuOR'),
    alt: 'Memorable moments at CopanDigital',
    icon: Camera,
    label: 'Moments',
    description: 'Snapshots from our journey together.',
  },
];

const AUTOPLAY_MS = 5000;

function SlideContent({ slide }: { slide: GallerySlide }) {
  const Icon = slide.icon;

  return (
    <div className="relative size-full">
      {slide.src ? (
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500" />
      )}
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
          Share your favorite CopanDigital moments with us!
        </p>
      </div>
    </section>
  );
}
