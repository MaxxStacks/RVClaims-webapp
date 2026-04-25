import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export function NotificationBar() {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // 0.8px per frame = ~48px/s at 60fps — comfortable reading speed
    const speed = 0.8;

    const tick = () => {
      posRef.current += speed;
      // Reset when we've scrolled exactly half the track (the duplicate takes over seamlessly)
      const half = track.scrollWidth / 2;
      if (posRef.current >= half) posRef.current = 0;
      track.style.transform = `translateX(${-posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const item = (ariaHidden: boolean, withLink: boolean) => (
    <span className="text-sm font-medium px-10 inline-flex items-center shrink-0" aria-hidden={ariaHidden || undefined}>
      <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
      {t('notificationBar.message')}{' '}
      {withLink
        ? <Link href="/contact" className="ml-1 underline hover:text-gray-200 transition-colors" data-testid="link-learn-more" aria-label="Learn more about our 2026 season special offer">{t('notificationBar.learnMore')}</Link>
        : <span className="ml-1 underline">{t('notificationBar.learnMore')}</span>
      }
      <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
    </span>
  );

  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative z-50 w-full" data-testid="notification-bar">
      {/* Track: 4 items + exact duplicate = seamless rAF loop */}
      <div ref={trackRef} className="animate-scroll">
        {item(false, true)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
      </div>
    </div>
  );
}