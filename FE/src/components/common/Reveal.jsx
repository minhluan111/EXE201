import { motion } from "framer-motion";

export default function Reveal({
  children,
  delay = 0,
  once = true,
  y = 16,
  sx = {},
}) {
  return (
    <motion.div
      style={sx}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
