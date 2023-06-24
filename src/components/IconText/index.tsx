import React from 'react';
import styled from 'styled-components';

const Wrap = styled.span`
  display: flex;
  align-items: center;
`;

const Text = styled.span`
  margin-left: 0.5rem;
`;

const Icon = styled.span`
  display: flex;
  font-size: 18px;
`;

export interface IconTextProps {
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  text?: React.ReactNode;
}

export default function IconText({ children, className, text, ...props }: IconTextProps) {
  if (props.position === 'right') {
    return (
      <Wrap className={className} {...props}>
        {text && <Text>{text}</Text>}
        <Icon className="ml-2">{children}</Icon>
      </Wrap>
    );
  }

  return (
    <Wrap className={className} {...props}>
      <Icon>{children}</Icon>
      {text && <Text>{text}</Text>}
    </Wrap>
  );
}
