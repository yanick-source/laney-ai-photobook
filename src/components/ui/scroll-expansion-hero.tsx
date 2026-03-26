import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to expansion values
  const mediaWidthPercent = useTransform(scrollYProgress, [0, 0.3, 0.6], [30, 50, 100]);
  const mediaHeightVh = useTransform(scrollYProgress, [0, 0.3, 0.6], [40, 60, 100]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.3, 0.6], [16, 8, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.6, 0.3, 0]);
  const textTranslateX = useTransform(scrollYProgress, [0.1, 0.5], [0, 150]);
  const contentOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div ref={sectionRef} className="relative" style={{ height: '250vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${bgImageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark bg overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="flex flex-col items-center justify-center w-full relative z-10 gap-6">
          {/* Title text */}
          <div
            className={`flex items-center justify-center text-center gap-2 md:gap-4 w-full relative z-10 flex-col ${
              textBlend ? 'mix-blend-difference' : ''
            }`}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground"
              style={{ x: useTransform(textTranslateX, (v) => `-${v}vw`) }}
            >
              {firstWord}
            </motion.h2>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground"
              style={{ x: useTransform(textTranslateX, (v) => `${v}vw`) }}
            >
              {restOfTitle}
            </motion.h2>
          </div>

          {/* Media container */}
          <motion.div
            className="relative overflow-hidden mx-auto"
            style={{
              width: useTransform(mediaWidthPercent, (v) => `${v}%`),
              height: useTransform(mediaHeightVh, (v) => `${v}vh`),
              borderRadius: useTransform(borderRadius, (v) => `${v}px`),
              maxWidth: '95vw',
            }}
          >
            {mediaType === 'video' ? (
              <div className="relative w-full h-full pointer-events-none">
                <video
                  src={mediaSrc}
                  poster={posterSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-black/30"
                  style={{ opacity: overlayOpacity }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={mediaSrc}
                  alt={title || 'Media content'}
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  style={{ opacity: overlayOpacity }}
                />
              </div>
            )}
          </motion.div>

          {/* Scroll hint */}
          {scrollToExpand && (
            <motion.p
              className="text-sm text-primary-foreground/80 font-medium text-center"
              style={{ opacity: scrollHintOpacity }}
            >
              {scrollToExpand}
            </motion.p>
          )}
        </div>

        {/* Children content fades in */}
        <motion.section
          className="absolute bottom-0 left-0 right-0 flex flex-col w-full px-8 py-10 md:px-16"
          style={{ opacity: contentOpacity }}
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
};

export default ScrollExpandMedia;
