import _ from 'lodash';
import React, { Children, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { StyledMovableContainer, StyledShadow } from './styled';

export interface MovableContainerProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onMouseUp: (insertOrder: number) => void;
}

export type Position = {
  mid: number;
  elem: Element;
}[];

export const MovableContainer = React.forwardRef(function MovableContainerWithRef(
  { className, children, disabled, onMouseUp }: MovableContainerProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positions = useRef<Position>([]);
  const [insertOrder, setInsertOrder] = useState<number>();
  const [activeTarget, setActiveTarget] = useState<null | HTMLDivElement>(null);
  const shouldCorrect = useRef<boolean>(false);

  useImperativeHandle(
    ref,
    () => {
      return containerRef.current;
    },
    [],
  );

  // 建立方位索引
  useEffect(() => {
    if (!containerRef.current || disabled) {
      return;
    }

    positions.current = [];
    const movableItems = containerRef.current.querySelectorAll('.candi-movable-item');

    for (let i = 0; i < movableItems.length; i += 1) {
      const itemNode = movableItems[i];
      const boundingRect = itemNode.getBoundingClientRect();

      positions.current.push({
        mid: boundingRect.top + window.scrollY + boundingRect.height / 2,
        elem: itemNode,
      });
    }
  }, [activeTarget, disabled]);

  const handleOnMouseMove = _.throttle(
    useCallback(
      (e: MouseEvent) => {
        if (disabled || !activeTarget) {
          return;
        }

        const elements = document.elementsFromPoint(e.clientX, e.clientY);

        if (!elements.includes(containerRef.current!)) {
          setInsertOrder(undefined);
        }

        if (!elements.includes(containerRef.current!)) {
          return;
        }

        let order = 0;
        const mids = positions.current;
        let indexOfActiveTarget = -1;
        const y = e.clientY + window.scrollY;

        for (let i = 0; i < mids.length; i += 1) {
          const { mid, elem } = mids[i];

          if (activeTarget && activeTarget === elem) {
            indexOfActiveTarget = i;
          }

          if ((i !== mids.length - 1 && y >= mid && y <= mids[i + 1].mid) || (i === mids.length - 1 && y >= mid)) {
            order = i + 1;

            // 元素在自己周围松开，并未发生变化
            shouldCorrect.current = indexOfActiveTarget > -1 && order > indexOfActiveTarget;
            break;
          }
        }

        if (insertOrder !== order) {
          // correctOrder用于在settings中更新，insertOrder用于在交互时显示
          setInsertOrder(order);
        }
      },
      [activeTarget, disabled, insertOrder],
    ),
    50,
  );

  const newChildren = Array.isArray(children) ? _.chain(children).compact().flatten().value() : children;

  if (Array.isArray(newChildren) && typeof insertOrder !== 'undefined') {
    newChildren.splice(insertOrder, 0, <div className="empty-block candi-movable-item" />);
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleOnMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleOnMouseMove);
    };
  }, [handleOnMouseMove]);

  const handleActive = useCallback(
    (e: CustomEvent<{ elem: HTMLDivElement | null; evt: MouseEvent }>) => {
      setActiveTarget(e.detail.elem);

      if (!e.detail.elem) {
        // 只向位于上方的container触发回调
        const elements = document.elementsFromPoint(e.detail.evt.clientX, e.detail.evt.clientY);
        if (elements.includes(containerRef.current!) && typeof insertOrder !== 'undefined') {
          onMouseUp(shouldCorrect.current ? insertOrder! - 1 : insertOrder!);
          shouldCorrect.current = false;
        }
        setInsertOrder(undefined);
      }
    },
    [insertOrder, onMouseUp],
  );

  useEffect(() => {
    // @ts-ignore
    document.addEventListener('target-active', handleActive);

    return () => {
      // @ts-ignore
      document.removeEventListener('target-active', handleActive);
    };
  }, [handleActive]);

  return (
    <StyledMovableContainer className={className} ref={containerRef}>
      {newChildren}
    </StyledMovableContainer>
  );
});

export interface MovableTargetProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

interface StartPosition {
  left: number;
  top: number;
  innerOffsetLeft: number;
  innerOffsetTop: number;
}

export function MovableTarget({ children, className = '', disabled, onMouseDown, onMouseUp }: MovableTargetProps) {
  const [active, toggleActive] = useState(false);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<StartPosition>({} as StartPosition);
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const shadowNodeRef = useRef<HTMLButtonElement | null>(null);

  const handleOnMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!shadowRef.current) {
        return;
      }

      if (!active) {
        toggleActive(true);
      }
      const left = e.pageX - positionRef.current.innerOffsetLeft;
      const top = e.pageY - positionRef.current.innerOffsetTop + window.scrollY;

      shadowRef.current.style.transform = `translate(${left}px, ${top}px)`;
    },
    [active],
  );

  const handleOnMouseUp = useCallback(
    (e: MouseEvent) => {
      if (typeof onMouseUp === 'function') {
        onMouseUp();
      }
      toggleActive(false);

      document.dispatchEvent(
        new CustomEvent('target-active', {
          detail: {
            elem: null,
            evt: e,
          },
        }),
      );

      if (targetRef.current) {
        targetRef.current.style.opacity = '1';
      }

      document.removeEventListener('mousemove', handleOnMouseMove);
      document.removeEventListener('mouseup', handleOnMouseUp);
    },
    [handleOnMouseMove, onMouseUp],
  );

  const handleOnMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !targetRef.current || e.nativeEvent.which !== 1) {
        return;
      }

      // 告诉movableContainer哪个元素被激活，从而把这个元素从该容器的方位索引中排除
      document.dispatchEvent(
        new CustomEvent('target-active', {
          detail: {
            elem: targetRef.current,
            evt: e,
          },
        }),
      );

      e.preventDefault();

      if (typeof onMouseDown === 'function') {
        onMouseDown();
      }

      const boundingRect = targetRef.current?.getBoundingClientRect();
      positionRef.current = {
        left: e.pageX,
        top: e.pageY,
        innerOffsetLeft: e.pageX - boundingRect.left,
        innerOffsetTop: e.pageY - boundingRect.top,
      };

      if (targetRef.current) {
        targetRef.current.style.opacity = '0.5';
      }

      if (shadowNodeRef.current) {
        shadowNodeRef.current.style.width = `${boundingRect.width}px`;
        shadowNodeRef.current.style.height = `${boundingRect.height}px`;
      }
      document.addEventListener('mousemove', handleOnMouseMove);
      document.addEventListener('mouseup', handleOnMouseUp);
    },
    [disabled, handleOnMouseMove, handleOnMouseUp, onMouseDown],
  );

  if (!children) {
    return null;
  }

  const newNode = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        // @ts-ignore
        ...child.props,
        onMouseDown: handleOnMouseDown,
        className: (child.props.className || '') + ` ${className} candi-movable-item`,
        ref: targetRef,
      });
    }

    return null;
  });

  const shadowNode = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        // @ts-ignore
        ref: shadowNodeRef,
      });
    }

    return null;
  });

  const shadowTarget = ReactDOM.createPortal(
    // @ts-ignore
    <StyledShadow visible={active} ref={shadowRef}>
      {shadowNode}
    </StyledShadow>,
    document.getElementById('movable')!,
  );

  return (
    <>
      {newNode}
      {shadowTarget}
    </>
  );
}
