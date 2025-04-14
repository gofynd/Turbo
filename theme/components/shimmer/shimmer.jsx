import React from "react";
import styles from "./shimmer.less";

function Shimmer({ height = "100vh", width = "100%", className = "" }) {
  return (
    <div
      style={{ "--height": height, "--width": width }}
      className={`${styles.shimmerBox} ${className}`}
    />
  );
}

export default Shimmer;
