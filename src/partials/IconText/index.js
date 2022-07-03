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

export default function IconText({ children, className, text, ...props }) {
  return (
    <Wrap className={className} {...props}>
      <Icon>{children}</Icon>
      {text && <Text>{text}</Text>}
    </Wrap>
  );
}
