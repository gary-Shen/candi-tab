import styled from 'styled-components';

const StyledBlock = styled.div`
  padding: 8px;

  .card {
    height: 100%;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    user-select: none;
    .editable & {
      cursor: move;
    }
  }

  .block-content {
    display: flex;
    flex-direction: column;
  }

  .link-btn {
    margin-top: 0.5rem;

    &:first-child {
      margin-top: 0;
    }
  }

  .link-group {
    width: 100%;
  }

  .block-edit {
    cursor: pointer;
  }

  .add-bth {
    border: 1px dashed #ccc;
    &:hover {
      border: 1px dashed #ccc;
    }
  }
`;

export default StyledBlock;
