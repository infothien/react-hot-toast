import * as React from 'react';
import { useCallback } from 'react';
import { styled, keyframes, CSSAttribute } from 'goober';

import {
  Toast,
  ToastPosition,
  resolveValueOrFunction,
  ToastAnimation,
} from '../core/types';
import { Indicator } from './indicator';
import { AnimatedIconWrapper } from './icon-wrapper';

type AnimationFactors = {
  verticalFactor: number;
  animation?: ToastAnimation;
};

const enterAnimation = ({ verticalFactor, animation }: AnimationFactors) => {
  if (!animation) {
    return `
      0% {transform: translate3d(0,${verticalFactor *
        -80}px,0) scale(.6); opacity:.5;}
      100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
      `;
  }

  switch (animation) {
    case 'slide-down':
      return `
        0% {transform: translate3d(0,-80px,0) scale(.6); opacity:.5;}
        100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
        `;
    case 'slide-up':
      return `
        0% {transform: translate3d(0,80px,0) scale(.6); opacity:.5;}
        100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
        `;
    case 'slide-left':
      return `
        0% {transform: translate3d(1000px,0,0) scale(.6); opacity:.5;}
        100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
        `;
    case 'slide-right':
      return `
        0% {transform: translate3d(-1000px,0,0) scale(.6); opacity:.5;}
        100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
        `;
  }
};

const exitAnimation = ({ verticalFactor, animation }: AnimationFactors) => {
  if (!animation)
    return `
      0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
      100% {transform: translate3d(0,${verticalFactor *
        -130}px,-1px) scale(.5); opacity:0;}
      `;

  switch (animation) {
    case 'slide-down':
      return `
        0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
        100% {transform: translate3d(0,-130px,-1px) scale(.5); opacity:0;}
        `;
    case 'slide-up':
      return `
        0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
        100% {transform: translate3d(0,130px,-1px) scale(.5); opacity:0;}
        `;
    case 'slide-left':
      return `
        0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
        100% {transform: translate3d(300px,0,-1px) scale(.5); opacity:0;}
        `;
    case 'slide-right':
      return `
        0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
        100% {transform: translate3d(-300px,0,-1px) scale(.5); opacity:0;}
        `;
  }
};

const ToastBarBase = styled('div', React.forwardRef)`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  margin: 16px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`;

const Message = styled('div')`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1;
`;

interface ToastBarProps {
  toast: Toast;
  offset: number;
  onHeight: (height: number) => void;

  position: ToastPosition;
}

const getPositionStyle = (
  position: ToastPosition,
  offset: number
): React.CSSProperties => {
  const top = position.includes('top');
  const verticalStyle = top ? { top: 0 } : { bottom: 0 };

  const horizontalStyle: CSSAttribute = position.includes('left')
    ? {
        left: 0,
      }
    : position.includes('right')
    ? {
        right: 0,
      }
    : {
        left: 0,
        right: 0,
        justifyContent: 'center',
      };
  return {
    position: 'fixed',
    transition: 'all 230ms cubic-bezier(.21,1.02,.73,1)',
    transform: `translateY(${offset * (top ? 1 : -1)}px)`,
    ...verticalStyle,
    ...horizontalStyle,
  };
};

const getAnimationStyle = (
  position: ToastPosition,
  visible: boolean,
  animation?: ToastAnimation
): React.CSSProperties => {
  const top = position.includes('top');
  const verticalFactor = top ? 1 : -1;

  return visible
    ? {
        animation: `${keyframes`${enterAnimation({
          verticalFactor,
          animation,
        })}`} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`,
      }
    : {
        animation: `${keyframes`${exitAnimation({
          verticalFactor,
          animation,
        })}`} 0.8s forwards cubic-bezier(.06,.71,.55,1)`,
        pointerEvents: 'none',
      };
};

export const ToastBar: React.FC<ToastBarProps> = React.memo(
  ({ toast, position, ...props }) => {
    const ref = useCallback((el: HTMLElement | null) => {
      if (el) {
        setTimeout(() => {
          const boundingRect = el.getBoundingClientRect();
          props.onHeight(boundingRect.height);
        });
      }
    }, []);

    const positionStyle = getPositionStyle(position, props.offset);
    const animationStyle = toast?.height
      ? getAnimationStyle(position, toast.visible, toast.animation)
      : { opacity: 0 };

    const renderIcon = () => {
      const { icon, type, iconTheme } = toast;
      if (icon !== undefined) {
        if (typeof icon === 'string') {
          return <AnimatedIconWrapper>{icon}</AnimatedIconWrapper>;
        } else {
          return icon;
        }
      }

      return <Indicator theme={iconTheme} type={type} />;
    };

    return (
      <div
        style={{
          display: 'flex',
          zIndex: toast.visible ? 9999 : undefined,
          pointerEvents: 'none',
          ...positionStyle,
        }}
      >
        <ToastBarBase
          ref={ref}
          className={toast.className}
          style={{
            pointerEvents: 'initial',
            ...animationStyle,
            ...toast.style,
          }}
        >
          {renderIcon()}
          <Message role={toast.role} aria-live={toast.ariaLive}>
            {resolveValueOrFunction(toast.message, toast)}
          </Message>
        </ToastBarBase>
      </div>
    );
  }
);
