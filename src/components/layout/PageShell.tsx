'use client';
import { motion } from 'framer-motion';
import { pageVariants } from '@/utils/animations';
export function PageShell({ children }: { children: React.ReactNode }) {
  return <motion.div variants={pageVariants} initial="hidden" animate="visible" className="flex flex-col flex-1 overflow-hidden">{children}</motion.div>;
}
