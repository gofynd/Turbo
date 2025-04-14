import React, { useState, useRef, useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "../core/fy-image/fy-image";
import { currencyFormat, isRunningOnClient } from "../../helper/utils";
import styles from "./product-hotspot.less";
import HotspotIcon from "../../assets/images/hotspot.svg";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";

const Hotspot = ({
  product,
  hotspot,
  isMobile,
  hotspot_link_text = "",
  redirect_link = "",
  aspectRatio = 1,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [tooltipClassDesktop, setTooltipClassDesktop] = useState("");
  const [tooltipClassMobile, setTooltipClassMobile] = useState("");
  const hotspotRef = useRef(null);

  const showHotspot = () => setIsActive(true);
  const hideHotspot = () => setIsActive(false);

  const checkTooltipPosition = () => {
    if (!isRunningOnClient()) return;

    const hotspotElement = hotspotRef.current;
    if (!hotspotElement) return;

    const parentWidth = hotspotElement.offsetParent?.clientWidth;

    if (window.innerWidth > 480) {
      if (hotspotElement.offsetLeft < 165) {
        setTooltipClassDesktop("tooltip-right");
      }
      if (hotspotElement.offsetLeft + 165 > parentWidth) {
        setTooltipClassDesktop("tooltip-left");
      }
    } else {
      if (hotspotElement.offsetLeft < 136) {
        setTooltipClassMobile("tooltip-mob-right");
      }
      if (hotspotElement.offsetLeft + 136 > parentWidth) {
        setTooltipClassMobile("tooltip-mob-left");
      }
    }
  };

  useEffect(() => {
    checkTooltipPosition();
    if (isRunningOnClient()) {
      window.addEventListener("resize", checkTooltipPosition);
    }
    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", checkTooltipPosition);
      }
    };
  }, []);

  const getHotspotStyle = useMemo(() => {
    let transform = "";
    let top;
    let right;
    let bottom;
    let left = "auto";
    const xpos = hotspot?.props?.x_position?.value;
    const ypos = hotspot?.props?.y_position?.value;

    if (xpos < 50) {
      left = `${xpos}%`;
    } else if (xpos === 50) {
      left = `${xpos}%`;
      transform += " translateX(-50%)";
    } else {
      left = "auto";
      right = `${100 - xpos}%`;
    }

    if (ypos < 50) {
      top = `${ypos}%`;
    } else if (ypos === 50) {
      top = `${ypos}%`;
      transform += " translateY(-50%)";
    } else {
      top = "auto";
      bottom = `${100 - ypos}%`;
    }

    return {
      "--top": top,
      "--right": right,
      "--bottom": bottom,
      "--left": left,
      "--transform": transform,
    };
  }, [hotspot]);

  const getProductImage = useMemo(() => {
    return product?.media?.find((media) => media.type === "image")?.url || "";
  }, [product, isMobile]);

  const redirectValue = product?.slug
    ? `/product/${product?.slug}`
    : redirect_link;

  return (
    <div
      className={styles.hotspot}
      style={getHotspotStyle}
      onMouseEnter={() => showHotspot()}
      onMouseLeave={() => hideHotspot()}
      onClick={() => showHotspot()}
      ref={hotspotRef}
    >
      <HotspotIcon className={styles.hotspot__icon} />
      {product && (
        <div
          className={`
            ${styles["hotspot__tooltip-wrapper"]}
            ${tooltipClassDesktop}
            ${tooltipClassMobile}
            ${isActive ? styles["hotspot__tooltip-wrapper--active"] : ""}
          `}
        >
          <FDKLink
            className={`${styles.hotspot__tooltip} ${styles.product}`}
            to={redirectValue}
            target="_self"
          >
            <FyImage
              customClass={`${styles.product__image} ${styles.fill}`}
              src={getProductImage}
              sources={[{ width: 84 }]}
              aspectRatio={aspectRatio}
              mobileAspectRatio={aspectRatio}
            />
            <div className={styles.product__meta}>
              <div className={styles.product__info}>
                {(product?.brand?.name || product?.hotspot_description) && (
                  <h4 className={styles.product__brand}>
                    {product?.brand?.name || product?.hotspot_description}
                  </h4>
                )}
                {product?.name && (
                  <p className={styles.product__name}>{product?.name}</p>
                )}
                {product?.sizes?.price?.effective?.min && (
                  <p className={styles.product__price}>
                    {currencyFormat(
                      product?.sizes?.price?.effective?.min,
                      product?.sizes?.price?.effective?.currency_symbol
                    )}
                  </p>
                )}
                {hotspot_link_text && (
                  <FDKLink
                    className={`${styles.product__price} ${styles.linkText}`}
                    to={redirect_link}
                    target="_self"
                  >
                    {hotspot_link_text}
                  </FDKLink>
                )}
              </div>
              {hotspot_link_text && redirect_link && (
                <ArrowDownIcon className={styles["icon-right"]} />
              )}
            </div>
          </FDKLink>
        </div>
      )}
    </div>
  );
};

export default Hotspot;
