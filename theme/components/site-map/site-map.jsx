import React, { useEffect, useRef, useState } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./site-map.less";
import useSiteMap from "../../page-layouts/site-map/useSiteMap";
import Loader from "../../components/loader/loader";

const SitemapItem = ({ to, label }) => (
  <div className={styles.sitemapItem}>
    <FDKLink to={to}>{label}</FDKLink>
  </div>
);

const SitemapSection = ({
  title,
  data = [],
  sectionLink = "",
  pathPrefix = "",
  labelKey,
  pathKey,
}) => (
  <div className={styles.sitemapSection}>
    <div
      className={`${styles.sectionTitle} ${
        sectionLink ? styles.hoverStyles : ""
      }`}
    >
      <FDKLink to={sectionLink}>{title}</FDKLink>
    </div>

    {data?.map((item) => (
      <SitemapItem
        to={`${pathPrefix}${item[pathKey]}`}
        label={item[labelKey]}
        key={item[pathKey]}
      />
    ))}
  </div>
);

function SiteMap({ props }) {
  const { sitemapSections, loading: isLoading } = useSiteMap();
  const containerRef = useRef(null);
 
  function getMaxSectionLength(sections = []) {
    return sections.reduce((max, s) => {
      const len = Array.isArray(s?.data) ? s.data.length : 0;
      return len > max ? len : max;
    }, 0);
  }

const sitemapContainerLength = Math.max(getMaxSectionLength(sitemapSections) * 43 + 20 , 600);
  
  return (
    <div className={styles.sitemapContainer} style={{"--dynamicHeight" : `${sitemapContainerLength }px` }}>
      <div className={styles.sitemapTitle}>{props?.sitemap_text?.value}</div>

      <div
        ref={containerRef}
        className={styles.sitemapSections}
      >
        {isLoading ? (
          <Loader />
        ) : (
          sitemapSections?.map((section) => (
            <SitemapSection
              key={section?.title}
              title={section?.title}
              data={section?.data}
              sectionLink={section?.sectionLink}
              pathPrefix={section?.pathPrefix}
              labelKey={section?.labelKey}
              pathKey={section?.pathKey}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default SiteMap;
