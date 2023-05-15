import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const StyledButton = styled.button`
  transition: all 0.2s;
`;

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <StyledButton
      onClick={onClick}
      className="inline-flex justify-center rounded-md leading-8 bg-color-primary text-white px-4 font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {children}
    </StyledButton>
  );
}
