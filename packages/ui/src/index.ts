/**
 * @orbyt/ui
 * Foundational reusable UI components and tokens for the Orbyt Monorepo ecosystem.
 */

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantStyles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 focus:ring-neutral-600',
    outline: 'border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500',
    ghost: 'text-neutral-400 hover:text-white hover:bg-neutral-800/50',
  }[variant];

  return React.createElement(
    'button',
    {
      className: `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`,
      ...props,
    },
    children
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium';
  
  const variantStyles = {
    default: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  }[variant];

  return React.createElement(
    'span',
    {
      className: `${baseStyles} ${variantStyles} ${className}`,
      ...props,
    },
    children
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  error,
  id,
  ...props
}) => {
  return React.createElement(
    'div',
    { className: 'flex flex-col gap-1.5 w-full' },
    label &&
      React.createElement(
        'label',
        {
          htmlFor: id,
          className: 'text-xs font-mono text-neutral-400',
        },
        label
      ),
    React.createElement('input', {
      id,
      className: `w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors ${
        error ? 'border-red-500/50 focus:border-red-500' : ''
      } ${className}`,
      ...props,
    }),
    error &&
      React.createElement(
        'span',
        { className: 'text-xs text-red-400 font-mono mt-0.5' },
        error
      )
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  label,
  error,
  id,
  ...props
}) => {
  return React.createElement(
    'div',
    { className: 'flex flex-col gap-1.5 w-full' },
    label &&
      React.createElement(
        'label',
        {
          htmlFor: id,
          className: 'text-xs font-mono text-neutral-400',
        },
        label
      ),
    React.createElement('textarea', {
      id,
      className: `w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors ${
        error ? 'border-red-500/50 focus:border-red-500' : ''
      } ${className}`,
      ...props,
    }),
    error &&
      React.createElement(
        'span',
        { className: 'text-xs text-red-400 font-mono mt-0.5' },
        error
      )
  );
};

/**
 * Class name combiner utility
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}


