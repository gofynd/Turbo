import React from "react";
import PropTypes from "prop-types";
import styles from "./skeletons.less";

function Skeleton({
  type = "text",
  width,
  height,
  borderRadius = 8,
  lines = 1,
  spacing = 8,
  className = "",
  aspectRatio,
  direction = "column",
}) {
  const getSkeletonStyle = () => {
    const baseStyle = {};
    
    baseStyle.width = typeof width === 'number' ? `${width}px` : width;
    baseStyle.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
    
    if (height) {
      baseStyle.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    if (aspectRatio) {
      baseStyle.aspectRatio = aspectRatio;
    }
    
    return baseStyle;
  };

  const renderSkeleton = () => {
    const skeletonClasses = [
      styles.skeleton,
    ].filter(Boolean).join(' ');

    if (type === "text" || type === 'box') {
      return (
        <span className={`${styles.skeletonGroup} ${className}`} style={{ gap: `${spacing}px`, flexDirection: direction }}>
          {Array.from({ length: lines }, (_, index) => (
            <span
              key={index}
              className={skeletonClasses}
              style={getSkeletonStyle()}
            >
              &zwnj;
            </span>
          ))}
        </span>
      );
    }

    return (
      <div
        className={skeletonClasses}
        style={getSkeletonStyle()}
      />
    );
  };

  return renderSkeleton();
}

Skeleton.propTypes = {
  type: PropTypes.oneOf([
    "text",
    "title", 
    "button",
    "circle",
    "avatar",
    "rectangle",
    "card",
    "image",
    "box"
  ]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lines: PropTypes.number,
  spacing: PropTypes.number,
  className: PropTypes.string,
  aspectRatio: PropTypes.number,
  direction: PropTypes.oneOf(["row", "column"]),
};

export default Skeleton; 