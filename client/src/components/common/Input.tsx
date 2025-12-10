import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-emerald-100/80 mb-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-3 py-2 rounded-lg transition-all duration-200
          glass-input
          placeholder-white/30
          focus:ring-2 focus:ring-emerald-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-500 focus:ring-rose-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-rose-400">{error}</p>
            )}
        </div>
    );
};

export default Input;
