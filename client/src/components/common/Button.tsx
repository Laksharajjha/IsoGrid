import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'glass';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/20',
        secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md',
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30',
        glass: 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/20 backdrop-blur-md shadow-lg',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
