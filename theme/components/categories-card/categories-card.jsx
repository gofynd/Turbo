import React from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "./categories-card.less";

const CategoriesCard = ({ config, category, img, url, differ }) => {
  const {
    category_name_placement,
    category_name_position,
    category_name_text_alignment,
    show_category_name,
    img_container_bg,
    img_fill,
  } = config;

  return (
    img?.src && (
      <FDKLink
        to={url}
        className={`${styles.cardContainer} ${styles[category_name_placement]} ${styles[category_name_position]}`}
      >
        <div className={styles.imageWrapper}>
          <FyImage
            backgroundColor={img_container_bg}
            customClass={`${styles.imageGallery} ${
              img_fill ? styles.streach : ""
            }`}
            alt={category.name}
            src={img?.src}
            sources={img?.srcSet}
            aspectRatio={0.8}
            mobileAspectRatio={0.8}
            defer={differ}
          />
        </div>
        {show_category_name && category?.name && (
          <div
            className={`${styles.categoriesName} h5 ${styles.fontBody} ${styles.inlineBlock} ${styles[category_name_position]} ${styles[category_name_text_alignment]}`}
            title={category.name}
          >
            {category.name}
          </div>
        )}
      </FDKLink>
    )
  );
};

export default CategoriesCard;
