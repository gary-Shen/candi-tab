import styled from 'styled-components';

const StyledApp = styled.section`
  width: 1200px;
  margin-top: 1rem;

  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .editBtn {
    line-height: 100%;

    button {
      padding: 0 0.4rem;
    }
  }
  .blockActive {
    z-index: 2;
  }
`;

export default StyledApp;
