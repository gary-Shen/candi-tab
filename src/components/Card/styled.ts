import styled from 'styled-components';

const StyledCard = styled.div`
  background-color: var(--card-body-bg);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
`;

export const StyledCardHeader = styled.div`
  color: var(--font-color);
  background-color: var(--card-header-bg);
  border-bottom: 1px solid var(--border-color);
  padding: var(--card-padding-y) var(--card-padding-x);
  border-radius: calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px) 0 0;
`;

export const StyledCardBody = styled.div`
  padding: var(--card-padding-x);
  border-radius: 0 0 calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px);
`;
export const StyledCardFooter = styled.div`
  background-color: var(--card-header-bg);
  padding: var(--card-padding-y) var(--card-padding-x);
  border-top: 1px solid var(--border-color);
  border-radius: 0 0 calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px);
`;

export default StyledCard;
