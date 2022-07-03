import styled, { css } from 'styled-components';

export const buttonStyle = css`
  box-sizing: content-box;
  border: 0;
  display: flex;
  margin: 4px;
  padding: 6px;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all .2s;
  border-radius: 3px;
  background-color: transparent;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`;

const IconButton = styled.button(buttonStyle);

export default IconButton;