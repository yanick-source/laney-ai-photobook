import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Camera, Heart, Sparkles, Star, Image, BookOpen } from "lucide-react";

interface FloatingElement {
  id: number;
  icon: "polaroid" | "heart" | "sparkle" | "star" | "camera" | "book";
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

const elements: FloatingElement[] = [
  { id: 1, icon: "polaroid", x: 8, y: 20, size: 48, rotation: -12, delay: 0 },
  { id: 2, icon: "heart", x: 85, y: 15, size: 32, rotation: 15, delay: 0.2 },
  { id: 3, icon: "sparkle", x: 92, y: 45, size: 24, rotation: 0, delay: 0.4 },
  { id: 4, icon: "star", x: 5, y: 55, size: 28, rotation: 20, delay: 0.3 },
  { id: 5, icon: "camera", x: 88, y: 70, size: 36, rotation: -8, delay: 0.5 },
  { id: 6, icon: "book", x: 12, y: 75, size: 32, rotation: 10, delay: 0.1 },
  { id: 7, icon: "sparkle", x: 15, y: 35, size: 20, rotation: 45, delay: 0.6 },
  { id: 8, icon: "star", x: 78, y: 30, size: 22, rotation: -25, delay: 0.7 },
];

const IconComponent = ({ icon, size }: { icon: string; size: number }) => {
  const iconProps = { size, className: "text-primary/40" };
  
  switch (icon) {
    case "polaroid":
      return (
        <div 
          className="bg-white rounded-sm shadow-lg p-1 border border-border/50"
          style={{ width: size, height: size * 1.2 }}
        >
          <div className="w-full h-3/4 bg-gradient-to-br from-laney-peach to-secondary rounded-sm" />
          <div className="w-full h-1/4" />
        </div>
      );
    case "heart":
      return <Heart {...iconProps} fill="currentColor" />;
    case "sparkle":
      return <Sparkles {...iconProps} />;
    case "star":
      return <Star {...iconProps} fill="currentColor" />;
    case "camera":
      return <Camera {...iconProps} />;
    case "book":
      return <BookOpen {...iconProps} />;
    default:
      return <Image {...iconProps} />;
  }
};

export function FloatingHeroElements() {
  const [isMounted, setIsMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      // Normalize to -1 to 1
      mouseX.set((clientX / innerWidth - 0.5) * 2);
      mouseY.set((clientY / innerHeight - 0.5) * 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <FloatingItem
          key={element.id}
          element={element}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
        />
      ))}
    </div>
  );
}

function FloatingItem({
  element,
  smoothMouseX,
  smoothMouseY,
}: {
  element: FloatingElement;
  smoothMouseX: ReturnType<typeof useSpring>;
  smoothMouseY: ReturnType<typeof useSpring>;
}) {
  // Different parallax intensity for each element based on size
  const intensity = element.size / 40;
  
  const x = useTransform(smoothMouseX, [-1, 1], [-20 * intensity, 20 * intensity]);
  const y = useTransform(smoothMouseY, [-1, 1], [-15 * intensity, 15 * intensity]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        x,
        y,
      }}
      initial={{ opacity: 0, scale: 0, rotate: element.rotation - 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: element.rotation,
      }}
      transition={{
        delay: element.delay,
        duration: 0.6,
        ease: "easeOut",
      }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [element.rotation, element.rotation + 3, element.rotation],
        }}
        transition={{
          duration: 4 + element.delay * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <IconComponent icon={element.icon} size={element.size} />
      </motion.div>
    </motion.div>
  );
}
