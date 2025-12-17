/* eslint-disable react-hooks/refs */
import _ from 'lodash'
import React, { Children, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

export interface MovableContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onMouseUp'> {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onMouseUp: (insertOrder: number) => void
}

export type Position = {
  mid: number
  elem: Element
}[]

export const MovableContainer = React.forwardRef((
  { className, children, disabled, onMouseUp, ...rest }: MovableContainerProps,
  ref,
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const positions = useRef<Position>([])
  const [insertOrder, setInsertOrder] = useState<number>()
  const [activeTarget, setActiveTarget] = useState<null | HTMLDivElement>(null)
  const shouldCorrect = useRef<boolean>(false)

  useImperativeHandle(
    ref,
    () => {
      return containerRef.current
    },
    [],
  )

  // 建立方位索引
  useEffect(() => {
    if (!containerRef.current || disabled) {
      return
    }

    positions.current = []
    const movableItems = containerRef.current.querySelectorAll('.candi-movable-item')

    for (let i = 0; i < movableItems.length; i += 1) {
      const itemNode = movableItems[i]
      const boundingRect = itemNode.getBoundingClientRect()

      positions.current.push({
        mid: boundingRect.top + window.scrollY + boundingRect.height / 2,
        elem: itemNode,
      })
    }
  }, [activeTarget, disabled])

  const handleOnMouseMove = useMemo(
    () =>
      _.throttle(
        (e: MouseEvent) => {
          if (disabled || !activeTarget) {
            return
          }

          const elements = document.elementsFromPoint(e.clientX, e.clientY)

          if (!elements.includes(containerRef.current!)) {
            setInsertOrder(undefined)
          }

          if (!elements.includes(containerRef.current!)) {
            return
          }

          let order = 0
          const mids = positions.current
          let indexOfActiveTarget = -1
          const y = e.clientY + window.scrollY

          for (let i = 0; i < mids.length; i += 1) {
            const { mid, elem } = mids[i]

            if (activeTarget && activeTarget === elem) {
              indexOfActiveTarget = i
            }

            if (
              (i !== mids.length - 1 && y >= mid && y <= mids[i + 1].mid)
              || (i === mids.length - 1 && y >= mid)
            ) {
              order = i + 1

              // 元素在自己周围松开，并未发生变化
              shouldCorrect.current
                = indexOfActiveTarget > -1 && order > indexOfActiveTarget
              break
            }
          }

          if (insertOrder !== order) {
            // correctOrder用于在settings中更新，insertOrder用于在交互时显示
            setInsertOrder(order)
          }
        },
        50,
        { leading: true, trailing: false },
      ),
    [activeTarget, disabled, insertOrder],
  )

  const newChildren = Array.isArray(children) ? _.chain(children).compact().flatten().value() : children

  if (Array.isArray(newChildren) && typeof insertOrder !== 'undefined') {
    newChildren.splice(
      insertOrder,
      0,
      <div
        key="placeholder"
        className="empty-block candi-movable-item h-0 bg-color-primary outline outline-1 outline-color-primary"
      />,
    )
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleOnMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleOnMouseMove)
    }
  }, [handleOnMouseMove])

  const handleActive = useCallback(
    (e: CustomEvent<{ elem: HTMLDivElement | null, evt: MouseEvent }>) => {
      setActiveTarget(e.detail.elem)

      if (!e.detail.elem) {
        // 只向位于上方的container触发回调
        const elements = document.elementsFromPoint(e.detail.evt.clientX, e.detail.evt.clientY)
        if (elements.includes(containerRef.current!) && typeof insertOrder !== 'undefined') {
          onMouseUp(shouldCorrect.current ? insertOrder! - 1 : insertOrder!)
          shouldCorrect.current = false
        }
        setInsertOrder(undefined)
      }
    },
    [insertOrder, onMouseUp],
  )

  useEffect(() => {
    // @ts-expect-error - Custom DOM event
    document.addEventListener('target-active', handleActive)

    return () => {
      // @ts-expect-error - Custom DOM event
      document.removeEventListener('target-active', handleActive)
    }
  }, [handleActive])

  return (
    <div className={className} ref={containerRef} {...rest}>
      {newChildren}
    </div>
  )
})

export interface MovableTargetProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  getShadowNode?: (ref: React.RefObject<any>, targetRef: React.RefObject<any>) => React.ReactNode
  onMouseDown?: () => void
  onMouseUp?: () => void
  onCancel?: () => void
}

interface StartPosition {
  left: number
  top: number
  innerOffsetLeft: number
  innerOffsetTop: number
}

export function MovableTarget({
  children,
  className = '',
  disabled,
  onMouseDown,
  getShadowNode,
  onMouseUp,
  onCancel,
}: MovableTargetProps) {
  const [active, toggleActive] = useState(false)
  const activeRef = useRef(false)
  const shadowRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef<StartPosition>({} as StartPosition)
  const targetRef = useRef<HTMLButtonElement | null>(null)
  const shadowNodeRef = useRef<HTMLButtonElement | null>(null)

  // Refs for props to access latest values in stable handlers
  const onMouseUpPropRef = useRef(onMouseUp)
  const onCancelPropRef = useRef(onCancel)
  const onMouseDownPropRef = useRef(onMouseDown)

  // Update prop refs
  useEffect(() => {
    onMouseUpPropRef.current = onMouseUp
    onCancelPropRef.current = onCancel
    onMouseDownPropRef.current = onMouseDown
  }, [onMouseUp, onCancel, onMouseDown])

  // Stable handlers definitions
  const handlersRef = useRef<{
    mousemove: (e: MouseEvent) => void
    mouseup: (e: MouseEvent) => void
    keydown: (e: KeyboardEvent) => void
  }>({
    mousemove: () => { },
    mouseup: () => { },
    keydown: () => { },
  })

  // Initialize handlers once
  useEffect(() => {
    handlersRef.current.mousemove = (e: MouseEvent) => {
      if (!shadowRef.current) {
        return
      }

      if (!activeRef.current) {
        activeRef.current = true
        toggleActive(true)
      }
      const left = e.pageX - positionRef.current.innerOffsetLeft
      const top = e.pageY - positionRef.current.innerOffsetTop + window.scrollY

      shadowRef.current.style.transform = `translate(${left}px, ${top}px)`
    }

    handlersRef.current.mouseup = (e: MouseEvent) => {
      if (typeof onMouseUpPropRef.current === 'function') {
        onMouseUpPropRef.current()
      }
      activeRef.current = false
      toggleActive(false)

      document.dispatchEvent(
        new CustomEvent('target-active', {
          detail: {
            elem: null,
            evt: e,
          },
        }),
      )

      if (targetRef.current) {
        targetRef.current.style.opacity = '1'
      }

      document.removeEventListener('mousemove', handlersRef.current.mousemove)
      document.removeEventListener('mouseup', handlersRef.current.mouseup)
      document.removeEventListener('keydown', handlersRef.current.keydown)
    }

    handlersRef.current.keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (typeof onCancelPropRef.current === 'function') {
          onCancelPropRef.current()
        }
        activeRef.current = false
        toggleActive(false)

        document.dispatchEvent(
          new CustomEvent('target-active', {
            detail: {
              elem: null,
              evt: { clientX: -9999, clientY: -9999 }, // Dummy event to reset container
            },
          }),
        )

        if (targetRef.current) {
          targetRef.current.style.opacity = '1'
        }

        document.removeEventListener('mousemove', handlersRef.current.mousemove)
        document.removeEventListener('mouseup', handlersRef.current.mouseup)
        document.removeEventListener('keydown', handlersRef.current.keydown)
      }
    }
  }, []) // Empty dependency array ensures stable handlers

  const handleOnMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !targetRef.current || e.nativeEvent.which !== 1) {
        return
      }

      // 告诉movableContainer哪个元素被激活，从而把这个元素从该容器的方位索引中排除
      document.dispatchEvent(
        new CustomEvent('target-active', {
          detail: {
            elem: targetRef.current,
            evt: e,
          },
        }),
      )

      e.preventDefault()

      if (typeof onMouseDownPropRef.current === 'function') {
        onMouseDownPropRef.current()
      }

      const boundingRect = targetRef.current?.getBoundingClientRect()
      positionRef.current = {
        left: e.pageX,
        top: e.pageY,
        innerOffsetLeft: e.pageX - boundingRect.left,
        innerOffsetTop: e.pageY - boundingRect.top,
      }

      if (targetRef.current) {
        targetRef.current.style.opacity = '0.5'
      }

      if (!getShadowNode && shadowNodeRef.current) {
        shadowNodeRef.current.style.width = `${boundingRect.width}px`
        shadowNodeRef.current.style.height = `${boundingRect.height}px`
      }

      document.addEventListener('mousemove', handlersRef.current.mousemove)
      document.addEventListener('mouseup', handlersRef.current.mouseup)
      document.addEventListener('keydown', handlersRef.current.keydown)
    },
    [disabled, getShadowNode],
  )

  const newNode = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        onMouseDown: handleOnMouseDown,
        className: `${child.props.className || ''} ${className} candi-movable-item`,
        ref: targetRef,
      })
    }

    return null
  })

  const shadowNode = useMemo(() => {
    return getShadowNode
      ? getShadowNode(shadowNodeRef, targetRef)
      : Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ref: shadowNodeRef,
            })
          }

          return null
        })
  }, [children, getShadowNode])

  const shadowTarget = useMemo(
    () =>
      ReactDOM.createPortal(
        <div
          ref={shadowRef}
          className={`absolute left-0 top-0 cursor-move z-[999] w-full [&_button]:w-full ${active ? 'block' : 'hidden'
          }`}
        >
          {shadowNode}
        </div>,
        document.getElementById('movable')!,
      ),
    [active, shadowNode],
  )

  if (!children) {
    return null
  }

  return (
    <>
      {newNode}
      {shadowTarget}
    </>
  )
}
