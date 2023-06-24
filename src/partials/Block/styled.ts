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
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    border: 0;

    &:last-child {
      margin-bottom: 0;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  .link-group,
  .under-context-menu {
    margin: 0.25rem 0;
    &:last-child {
      margin-bottom: 0;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  .under-context-menu {
    .link-group {
      margin: 0;
    }
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
