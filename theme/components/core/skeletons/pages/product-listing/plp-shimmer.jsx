import React from "react";
import ProductCardSkeleton from "./product-card-skeleton";
import Skeleton from "../../core/skeleton";
import styles from "./plp-shimmer.less";

function PLPShimmer({
  gridDesktop = 4,
  gridTablet = 3,
  gridMobile = 2,
  showFilters = true,
  showSortBy = true,
  showPagination = true,
  productCount = 12,
  className = "",
}) {
  const renderProductGrid = () => {
    return Array.from({ length: productCount }, (_, index) => (
      <ProductCardSkeleton
        key={index}
        aspectRatio={4 / 5}
        showWishlist={true}
        showSaleTag={Math.random() > 0.7} // Randomly show sale tags
        showAddToCart={true}
      />
    ));
  };

  return (
    <div className={`${styles.plpShimmer} ${className}`}>
      {/* Breadcrumb Skeleton */}
      <div className={styles.breadcrumbContainer}>
        <Skeleton width="200px" height={16} />
      </div>

      {/* Header Section with Title and Sort */}
      <div className={styles.headerSection}>
        <div className={styles.titleSection}>
          <Skeleton width="150px" height={32} className={styles.pageTitle} />
          <Skeleton width="80px" height={16} className={styles.itemCount} />
        </div>

        {showSortBy && (
          <div className={styles.sortSection}>
            <Skeleton width="200px" height={40} />
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className={styles.contentContainer}>
        {/* Filters Sidebar */}
        {showFilters && (
          <div className={styles.filtersContainer}>
            <div className={styles.filtersHeader}>
              <Skeleton width="60px" height={20} />
            </div>

            {/* Filter Groups */}
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={styles.filterGroup}>
                <Skeleton
                  width="120px"
                  height={18}
                  className={styles.filterTitle}
                />
                <div className={styles.filterOptions}>
                  {Array.from({ length: 3 }, (_, optIndex) => (
                    <div key={optIndex} className={styles.filterOption}>
                      <Skeleton width={16} height={16} borderRadius="50%" />
                      <Skeleton width="100px" height={14} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className={styles.productsContainer}>
          <div
            className={styles.productsGrid}
            data-grid-desktop={gridDesktop}
            data-grid-tablet={gridTablet}
            data-grid-mobile={gridMobile}
          >
            {renderProductGrid()}
          </div>

          {/* Pagination Skeleton */}
          {showPagination && (
            <div className={styles.paginationContainer}>
              <div className={styles.pagination}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton
                    key={index}
                    width={40}
                    height={40}
                    borderRadius={6}
                    className={styles.paginationItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PLPShimmer;
