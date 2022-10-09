import styled from 'styled-components';

const StyledBlock = styled.div`
  padding: 8px;

  .card {
    height: 100%;
    background-color: var(--card-body-bg);
    border-color: var(--border-color);
  }

  .block-header {
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
    padding: var(--card-padding-x);
  }

  .link-btn {
    width: 100%;
    margin: 0.25rem 0;

    &:last-child {
      margin-bottom: 0;
    }

    &:first-child {
      margin-top: 0;
    }

    .under-context-menu & {
      margin: 0;
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
