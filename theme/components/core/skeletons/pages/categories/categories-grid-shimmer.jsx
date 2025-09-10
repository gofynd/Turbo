import React from "react";
import CategoryCardSkeleton from "./category-card-skeleton";
import styles from "./categories-grid-shimmer.less";

function CategoriesGridShimmer({ categoryCount = 8, className = "" }) {
  const renderCategoryGrid = () => {
    return Array.from({ length: categoryCount }, (_, index) => (
      <CategoryCardSkeleton
        key={index}
        aspectRatio={0.8} // Match real categories implementation
        showCategoryName={true}
      />
    ));
  };

  return (
    <div className={`${styles.categoriesGridShimmer} ${className}`}>
      {renderCategoryGrid()}
    </div>
  );
}

export default CategoriesGridShimmer;
