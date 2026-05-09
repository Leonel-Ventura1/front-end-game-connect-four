import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
};

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & ButtonBaseProps;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    accent: 'bg-accent-yellow hover:bg-opacity-90 text-black',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};