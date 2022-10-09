import styled from 'styled-components';

const StyledOauth = styled.div`
  .oauth-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .oauth-form {
    width: 100%;

    .mb-3:last-child {
      margin-bottom: 0 !important;
    }
  }
`;

export default StyledOauth;
