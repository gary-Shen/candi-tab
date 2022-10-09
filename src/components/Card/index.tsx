import React from 'react';

import StyledCard, { StyledCardBody, StyledCardFooter, StyledCardHeader } from './styled';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function Card({ className, children }: CardProps) {
  return <StyledCard className={className}>{children}</StyledCard>;
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader = React.forwardRef(
  ({ className, children }: CardHeaderProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <StyledCardHeader className={className} ref={ref}>
        {children}
      </StyledCardHeader>
    );
  },
);

export interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

function CardBody({ className, children }: CardBodyProps) {
  return <StyledCardBody className={className}>{children}</StyledCardBody>;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}
function CardFooter({ className, children }: CardFooterProps) {
  return <StyledCardFooter className={className}>{children}</StyledCardFooter>;
}

export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
