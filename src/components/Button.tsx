import type { ButtonHTMLAttributes } from 'react'
import React from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex justify-center rounded-md leading-8 bg-color-primary text-white px-4 font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
    >
      {children}
    </button>
  )
}
