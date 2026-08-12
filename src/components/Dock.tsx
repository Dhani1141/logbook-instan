"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, SpringOptions } from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState, ReactElement } from 'react';

import './Dock.css';

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mousePos: any;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  label?: string;
  direction: 'horizontal' | 'vertical';
}

function DockItem({ children, className = '', onClick, mousePos, spring, distance, magnification, baseItemSize, label, direction }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const isVertical = direction === 'vertical';

  const mouseDistance = useTransform(mousePos, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: baseItemSize,
      height: baseItemSize
    };
    return val - (isVertical ? rect.y : rect.x) - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {Children.map(children, child => cloneElement(child as ReactElement<any>, { isHovered }))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', direction = 'horizontal', ...rest }: { children: React.ReactNode; className?: string; direction?: 'horizontal' | 'vertical'; [key: string]: any }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={direction === 'vertical' ? { opacity: 0, x: 0 } : { opacity: 0, y: 0 }}
          animate={direction === 'vertical' ? { opacity: 1, x: 10 } : { opacity: 1, y: -10 }}
          exit={direction === 'vertical' ? { opacity: 0, x: 0 } : { opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label dock-label-${direction} ${className}`}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

interface DockProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
  }>;
  className?: string;
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
  direction?: 'horizontal' | 'vertical';
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
  direction = 'horizontal'
}: DockProps) {
  const isVertical = direction === 'vertical';
  const mousePos = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const sizeRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const size = useSpring(sizeRow, spring);

  return (
    <motion.div style={isVertical ? { width: size, scrollbarWidth: 'none' } : { height: size, scrollbarWidth: 'none' }} className={`dock-outer dock-outer-${direction}`}>
      <motion.div
        onMouseMove={({ pageX, pageY }) => {
          isHovered.set(1);
          mousePos.set(isVertical ? pageY : pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mousePos.set(Infinity);
        }}
        className={`dock-panel dock-panel-${direction} ${className}`}
        style={isVertical ? { width: panelHeight } : { height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mousePos={mousePos}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            direction={direction}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel direction={direction}>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
