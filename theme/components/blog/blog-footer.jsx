import React, { useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/blog-footer.less";

function BlogFooter({ title, description, button_text, button_link }) {
  if (!title && !description && !button_text) {
    return null;
  }
  return (
    <div className={`${styles.footer}`}>
      <div className={`${styles.footer__container}`}>
        <h2 className={`${styles.footer__title}`}>{title}</h2>
        <p
          className={`${styles.footer__description} ${styles.textBody} ${styles.breakWords}`}
        >
          {description}
        </p>
        {button_text && (
          <div className={`${styles.footer__ctaWrapper} `}>
            <FDKLink
              className={`${styles.footer__cta} btnPrimary ${styles.breakWords}`}
              to={button_link}
            >
              {button_text}
            </FDKLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogFooter;
