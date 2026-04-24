import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  rightElement?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  breadcrumbs = [],
  rightElement,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-balanced max-w-2xl mt-1">
              {subtitle}
            </p>
          )}
        </motion.div>
        {rightElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {rightElement}
          </motion.div>
        )}
      </div>
    </div>
  );
}
