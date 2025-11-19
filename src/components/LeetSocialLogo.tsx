import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

export function LeetSocialLogo({ size = 44, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-2 group select-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring" }}
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Code2 className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur-lg opacity-0 group-hover:opacity-60"
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      </motion.div>
      {withText && (
        <motion.span
          className="text-xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-cyan-400 dark:to-white bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          LeetSocial
        </motion.span>
      )}
    </motion.div>
  );
}
