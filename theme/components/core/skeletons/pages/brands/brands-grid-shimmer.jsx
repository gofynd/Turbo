import React from "react";
import BrandCardSkeleton from "./brand-card-skeleton";
import styles from "./brands-grid-shimmer.less";

function BrandsGridShimmer({ brandCount = 8, className = "" }) {
  const renderBrandGrid = () => {
    return Array.from({ length: brandCount }, (_, index) => {
      // Randomly mix logo-based and image-based brand cards
      const isLogoBased = Math.random() > 0.6; // ~40% logo-based brands

      return (
        <BrandCardSkeleton
          key={index}
          aspectRatio={0.8}
          showLogo={isLogoBased}
          logoSize={isLogoBased ? 60 : 0}
          showBrandName={true}
        />
      );
    });
  };

  return (
    <div className={`${styles.brandsGridShimmer} ${className}`}>
      {renderBrandGrid()}
    </div>
  );
}

export default BrandsGridShimmer;
