import { useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedGreetingProps {
  employeeName: string;
  action: "clockin" | "clockout";
  onComplete: () => void;
}

export default function AnimatedGreeting({
  employeeName,
  action,
  onComplete,
}: AnimatedGreetingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = action === "clockin" 
    ? `Hello ${employeeName}!` 
    : `Goodbye ${employeeName}!`;

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          data-testid="text-greeting"
        >
          {message}
        </motion.h1>
        <motion.div
          className="mt-4 text-2xl text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {action === "clockin" ? "You're clocked in" : "You're clocked out"}
        </motion.div>
      </motion.div>
    </div>
  );
}
