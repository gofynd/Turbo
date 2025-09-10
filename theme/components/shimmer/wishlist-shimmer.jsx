import React from "react";
import Shimmer from "./shimmer";
import styles from "./wishlist-shimmer.less";

function WishlistShimmer({ count = 8 }) {
  return (
    <div className="basePageContainer margin0auto">
      <div className={styles.wishlistShimmerWrap}>
        {/* Breadcrumb shimmer */}
        <div className={styles.breadcrumbShimmer}>
          <Shimmer height="16px" width="80px" />
          {/* <span className={styles.separator}>›</span>
          <Shimmer height="16px" width="60px" /> */}
        </div>

        {/* Title shimmer */}
        <div className={styles.titleShimmer}>
          <Shimmer height="32px" width="120px" />
          <Shimmer height="20px" width="60px" />
        </div>

        {/* Grid of product card shimmers */}
        <div className={styles.gridShimmer}>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className={styles.productCardShimmer}>
              {/* Product image shimmer */}
              <div className={styles.imageShimmer}>
                <Shimmer height="100%" width="100%" />
              </div>

              {/* Product details shimmer */}
              <div className={styles.productDetails}>
                {/* Brand name */}
                <Shimmer
                  height="14px"
                  width="70%"
                  className={styles.marginBottom8}
                />

                {/* Product title */}
                <Shimmer
                  height="16px"
                  width="90%"
                  className={styles.marginBottom8}
                />
                <Shimmer
                  height="16px"
                  width="60%"
                  className={styles.marginBottom12}
                />

                {/* Price */}
                <div className={styles.priceShimmer}>
                  <Shimmer height="18px" width="80px" />
                  <Shimmer height="14px" width="60px" />
                </div>

                {/* Color options */}
                <div className={styles.colorOptionsShimmer}>
                  <Shimmer
                    height="20px"
                    width="20px"
                    className={styles.colorOption}
                  />
                  <Shimmer
                    height="20px"
                    width="20px"
                    className={styles.colorOption}
                  />
                  <Shimmer
                    height="20px"
                    width="20px"
                    className={styles.colorOption}
                  />
                  <Shimmer
                    height="20px"
                    width="20px"
                    className={styles.colorOption}
                  />
                  <span className={styles.moreColors}>+1</span>
                </div>

                {/* Add to cart button */}
                <div className={styles.buttonShimmer}>
                  <Shimmer height="44px" width="100%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WishlistShimmer;
