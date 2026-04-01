'use client';

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Gift,
  GraduationCap,
  Handshake,
  Heart,
  ImageIcon,
  Laugh,
  Loader2,
  Music,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type GalleryImage,
  getGalleryImageUrl,
  getGalleryImages,
} from '@/services/gallery';

import type { LucideIcon } from 'lucide-react';

interface SlideData {
  id: string;
  src: string;
  alt: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

const CATEGORY_META: Record<
  string,
  { icon: LucideIcon; label: string; description: string }
> = {
  celebrations: {
    icon: PartyPopper,
    label: 'Celebrations',
    description: 'Celebrating wins together as one team.',
  },
  team_spirit: {
    icon: Users,
    label: 'Team Spirit',
    description: 'Collaboration that drives us forward.',
  },
  achievements: {
    icon: Trophy,
    label: 'Achievements',
    description: 'Recognizing excellence and hard work.',
  },
  company_events: {
    icon: Gift,
    label: 'Company Events',
    description: 'Fun moments that bring us closer.',
  },
  culture: {
    icon: Heart,
    label: 'Our Culture',
    description: 'Values that define who we are.',
  },
  fun_at_work: {
    icon: Laugh,
    label: 'Fun at Work',
    description: 'Because work should be enjoyable too.',
  },
};

const FALLBACK_ICONS: LucideIcon[] = [
  Camera,
  Star,
  Sparkles,
  Music,
  Handshake,
  GraduationCap,
];

function toSlide(img: GalleryImage, index: number): SlideData {
  const meta = CATEGORY_META[img.category];
  const fallbackIcon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];

  return {
    id: img.id,
    src: getGalleryImageUrl(img.filename),
    alt: img.alt ?? `${meta?.label ?? img.category} at CopanDigital`,
    icon: meta?.icon ?? fallbackIcon,
    label: meta?.label ?? img.category,
    description: meta?.description ?? '',
  };
}

const AUTOPLAY_MS = 5000;

function SlideContent({ slide }: { slide: SlideData }) {
  const Icon = slide.icon;

  return (
    <div className="relative size-full">
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority
        unoptimized
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

export function GallerySection() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getGalleryImages();
        if (!cancelled) {
          setSlides(res.data.map((img, i) => toSlide(img, i)));
        }
      } catch {
        // Silently fail - gallery is non-critical
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused || total === 0) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused, total]);

  if (isLoading) {
    return (
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
            <p className="text-muted-foreground mt-3 text-sm">
              Loading gallery...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (total === 0) {
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
          <div className="text-muted-foreground mt-14 flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="mb-3 size-10 opacity-40" />
            <p className="font-medium">Gallery coming soon</p>
            <p className="mt-1 text-sm">
              Check back later for photos of our team moments.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
