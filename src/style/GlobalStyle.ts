import { createGlobalStyle, css } from 'styled-components';

interface GlobalStyleProps {
  editable?: boolean;
}

const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  body {
    background: var(--background-color);
    ${({ editable }: GlobalStyleProps) =>
      editable &&
      css`
        background-image: var(--background-image);
      `}
    background-repeat: repeat;
    background-attachment: fixed;
    background-position: initial;
    color: var(--font-color);
  }

  #root {
    display: flex;
    justify-content: center;
  }

  .editable {
    .react-grid-item > .react-resizable-handle {
      display: block;
    }
  }

  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
  }
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-item.react-grid-placeholder {
    background: blue;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  .react-resizable-handle-w {
    bottom: 50%;
    transform: translateY(50%);
    cursor: w-resize;
    left: 4px;
  }

  .react-resizable-handle-e {
    bottom: 50%;
    transform: translateY(50%);
    right: 4px;
    cursor: e-resize;
  }

  .react-grid-item > .react-resizable-handle {
    display: none;
    position: absolute;
    width: 10px;
    height: 100%;
    /* bottom: 0;
    right: 0; */
    background: none;
    /* background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjQ5NjYzMjg4NjQ0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI4NDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNOTM4LjY2NjY2NyA5MzguNjY2NjY3IDg1My4zMzMzMzMgOTM4LjY2NjY2NyA4NTMuMzMzMzMzIDg1My4zMzMzMzMgOTM4LjY2NjY2NyA4NTMuMzMzMzMzIDkzOC42NjY2NjcgOTM4LjY2NjY2N005MzguNjY2NjY3IDc2OCA4NTMuMzMzMzMzIDc2OCA4NTMuMzMzMzMzIDY4Mi42NjY2NjcgOTM4LjY2NjY2NyA2ODIuNjY2NjY3IDkzOC42NjY2NjcgNzY4TTc2OCA5MzguNjY2NjY3IDY4Mi42NjY2NjcgOTM4LjY2NjY2NyA2ODIuNjY2NjY3IDg1My4zMzMzMzMgNzY4IDg1My4zMzMzMzMgNzY4IDkzOC42NjY2NjdNNzY4IDc2OCA2ODIuNjY2NjY3IDc2OCA2ODIuNjY2NjY3IDY4Mi42NjY2NjcgNzY4IDY4Mi42NjY2NjcgNzY4IDc2OE01OTcuMzMzMzMzIDkzOC42NjY2NjcgNTEyIDkzOC42NjY2NjcgNTEyIDg1My4zMzMzMzMgNTk3LjMzMzMzMyA4NTMuMzMzMzMzIDU5Ny4zMzMzMzMgOTM4LjY2NjY2N005MzguNjY2NjY3IDU5Ny4zMzMzMzMgODUzLjMzMzMzMyA1OTcuMzMzMzMzIDg1My4zMzMzMzMgNTEyIDkzOC42NjY2NjcgNTEyIDkzOC42NjY2NjcgNTk3LjMzMzMzM1oiIHAtaWQ9IjI4NDEiPjwvcGF0aD48L3N2Zz4='); */
    background-position: bottom right;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
  }

  [data-reach-menu-popover] {
    z-index: 999;
  }

  /* context-menu */
  .LCM {
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    box-shadow: var(--box-shadow);
  }

  .LCM__group {
    border-color: var(--border-color);
  }

  .LCM__item {
    transition: none;
    font-size: 14px;
    min-height: 32px;

    &:hover {
      background-color: var(--color-primary);
      color: #fff;
    }
  }

  .form-control, .form-select {
    background-color: var(--background-color);
    color: var(--font-color);
    border-color: var(--border-color);

    &:focus {
      color: var(--font-color);
      border-color: var(--border-color);
      background-color: var(--background-color);
    }
  }

  .form-label {
    color: var(--font-color);
  }

  .form-control, .form-select {
    background-color: var(--form-inset-bg);
  }

  .list-group-item {
    background-color: var(--background-color);
    color: var(--font-color);
    border-color: var(--border-color);

    &.list-group-item-primary {
      background-color: var(--color-primary);
      color: #fff;
    }

    &.list-group-item-secondary {
      background-color: var(--color-secondary);
      color: #fff;
    }
  }

  .dropdown-menu {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
  }

  .dropdown-item {
    color: var(--font-color);
    &:hover {
      background-color: var(--color-primary);
      color: #fff;
    }
  }

  .input-group-text {
    background-color: var(--background-color);
    color: var(--font-color);
    border-color: var(--border-color);
  }
`;

export default GlobalStyle;
