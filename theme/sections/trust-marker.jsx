import React, { useMemo } from "react";
import { FDKLink, BlockRenderer } from "fdk-core/components";
import styles from "../styles/trust-marker.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";

export function Component({ props, globalConfig, blocks, preset }) {
  const {
    title: { value: title } = {},
    description: { value: description } = {},
    desktop_layout: { value: desktopLayout } = {},
    mobile_layout: { value: mobileLayout } = {},
    per_row_desktop: { value: perRowDesktop } = {},
    per_row_mobile: { value: perRowMobile } = {},
    card_background: { value: cardBackground } = {},
    padding_top: { value: paddingTop = 16 } = {},
    padding_bottom: { value: paddingBottom = 16 } = {},
  } = props;

  const getTrustMarker = useMemo(
    () => (blocks.length === 0 ? preset?.blocks || [] : blocks),
    [blocks, preset]
  );

  const isStackView = desktopLayout === "grid" || mobileLayout === "grid";
  const isHorizontalView =
    desktopLayout === "horizontal" || mobileLayout === "horizontal";

  const dynamicStyles = {
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
    "--img-background-color": cardBackground || globalConfig?.img_container_bg,
  };

  return (
    <section className={styles.sectionContainer} style={dynamicStyles}>
      <div className={`fx-title-block ${styles.headingContainer}`}>
        {!!title && (
          <h2 className={`fx-title ${styles.sectionTitle} fontHeader`}>
            {title}
          </h2>
        )}
        {!!description && (
          <p className={`fx-description ${styles.sectionDescription} bSmall`}>
            {description}
          </p>
        )}
      </div>
      {isStackView && (
        <StackLayout
          className={`${
            desktopLayout === "horizontal" ? styles.hideOnDesktop : ""
          } ${mobileLayout === "horizontal" ? styles.hideOnTablet : ""}`}
          trustMarker={getTrustMarker}
          globalConfig={globalConfig}
          colCount={Number(perRowDesktop)}
          colCountMobile={Number(perRowMobile)}
        />
      )}
      {isHorizontalView && (
        <HorizontalLayout
          className={`${desktopLayout === "grid" ? styles.hideOnDesktop : ""} ${
            mobileLayout === "grid" ? styles.hideOnTablet : ""
          }`}
          trustMarker={getTrustMarker}
          globalConfig={globalConfig}
          colCount={Number(perRowDesktop)}
          colCountMobile={Number(perRowMobile)}
        />
      )}
    </section>
  );
}

const StackLayout = ({
  className,
  trustMarker,
  globalConfig,
  colCount,
  colCountMobile,
}) => {
  const dynamicStyles = {
    "--item-count": `${colCount}`,
    "--item-count-mobile": `${colCountMobile}`,
  };
  return (
    <div className={`${styles.stackLayout} ${className}`} style={dynamicStyles}>
      {trustMarker.map(({ props }, i) => (
        <Trustmark key={i} props={props} globalConfig={globalConfig} />
      ))}
    </div>
  );
};

const HorizontalLayout = ({
  className,
  trustMarker,
  globalConfig,
  colCount,
  colCountMobile,
}) => {
  const { isRTL } = useLocaleDirection();

  const len = trustMarker?.length ?? 0;

  const options = useMemo(() => {
    return {
      direction: isRTL ? "rtl" : "ltr",
      loop: len > colCount,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: 1,
      duration: 35,
      breakpoints: {
        "(max-width: 480px)": {
          align: len > colCountMobile ? "center" : "start",
          loop: len > colCountMobile,
          slidesToScroll: colCountMobile,
        },
        "(min-width: 481px) and (max-width: 1023px)": {
          align: "start",
          loop: len > colCount,
          slidesToScroll: colCount,
        },
        "(min-width: 1024px)": {
          align: "start",
          loop: len > colCount,
          slidesToScroll: colCount,
        },
      },
    };
  }, [isRTL, len, colCount, colCountMobile]);

  return (
    <div
      className={`remove-horizontal-scroll ${styles.horizontalLayout} ${className}`}
    >
      <Carousel opts={options}>
        <CarouselContent>
          {trustMarker?.map((block, i) => (
            <CarouselItem
              key={i}
              className={styles.carouselItem}
              style={{
                "--count-desktop": colCount,
                "--count-mobile": colCountMobile,
              }}
            >
              {block?.type !== "trustmarker" ? (
                <BlockRenderer key={i} block={block} />
              ) : (
                <Trustmark
                  key={i}
                  className={styles.horizontalItem}
                  props={block.props}
                  globalConfig={globalConfig}
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={styles.carouselBtn} />
        <CarouselNext className={styles.carouselBtn} />
      </Carousel>
    </div>
  );
};

const Trustmark = ({ className = "", props = {}, globalConfig }) => {
  const {
    marker_heading: { value: markerTitle } = {},
    marker_description: { value: markerDescription } = {},
    marker_logo: { value: markerLogo } = {},
    marker_link: { value: markerLink } = {},
  } = props;
  return (
    <div className={`fx-trustmark-card ${className}`}>
      <FDKLink to={markerLink} className={`${styles.trustmark}`}>
        {markerLogo && (
          <FyImage
            customClass={`fx-trustmark-image ${styles.trustmarkImage}`}
            sources={globalConfig?.img_hd ? [] : [{ width: 200 }]}
            backgroundColor={globalConfig?.img_container_bg}
            src={markerLogo}
            isFixedAspectRatio={false}
          />
        )}
        <div className={styles.trustmarkData}>
          {!!markerTitle && (
            <span
              className={`fx-trustmark-title ${styles.trustmarkHeading} captionSemiBold fontHeader`}
            >
              {markerTitle}
            </span>
          )}
          {!!markerDescription && (
            <span
              className={`fx-trustmark-description ${styles.trustmarkDescription} bSmall`}
            >
              {markerDescription}
            </span>
          )}
        </div>
      </FDKLink>
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.trust_marker.trust_marker",
  props: [
    {
      type: "text",
      id: "title",
      default: "t:resource.default_values.trust_maker_title",
      label: "t:resource.common.heading",
    },
    {
      type: "text",
      id: "description",
      default: "t:resource.default_values.add_description",
      label: "t:resource.common.description",
    },
    {
      type: "color",
      id: "card_background",
      label: "t:resource.sections.trust_marker.card_background_color",
      info: "t:resource.sections.trust_marker.card_background_color_info",
      default: "",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "horizontal",
      label: "t:resource.sections.trust_marker.desktop_tablet_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      type: "range",
      id: "per_row_desktop",
      label: "t:resource.sections.trust_marker.columns_per_row_desktop_tablet",
      min: "3",
      max: "10",
      step: "1",
      info: "t:resource.common.not_applicable_for_mobile",
      default: "5",
    },
    {
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "horizontal",
      label: "t:resource.common.mobile_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      type: "range",
      id: "per_row_mobile",
      label: "t:resource.sections.trust_marker.columns_per_row_mobile",
      min: "1",
      max: "5",
      step: "1",
      info: "t:resource.sections.trust_marker.not_applicable_desktop",
      default: "2",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 16,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
  blocks: [
    {
      type: "trustmarker",
      name: "t:resource.sections.trust_marker.trust_marker",
      props: [
        {
          type: "image_picker",
          id: "marker_logo",
          default: "",
          label: "t:resource.common.icon",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "text",
          id: "marker_heading",
          default: "t:resource.default_values.free_delivery",
          label: "t:resource.common.heading",
        },
        {
          type: "text",
          id: "marker_description",
          default: "t:resource.default_values.marker_description",
          label: "t:resource.common.description",
        },
        {
          type: "url",
          id: "marker_link",
          default: "",
          label: "t:resource.common.redirect_link",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.trust_marker.trust_marker",
        props: {
          marker_heading: {
            type: "text",
            value: "Free Delivery",
          },
          marker_description: {
            type: "textarea",
            value: "Don't love it? Don't worry. Return delivery is free.",
          },
        },
      },
      {
        name: "t:resource.sections.trust_marker.trust_marker",
        props: {
          marker_heading: {
            type: "text",
            value: "Satisfied or Refunded",
          },
          marker_description: {
            type: "textarea",
            default: "Don’t love it? Don’t worry. Return delivery is free",
          },
        },
      },
      {
        name: "t:resource.sections.trust_marker.trust_marker",
        props: {
          marker_heading: {
            type: "text",
            value: "Top-notch Support",
          },
          marker_description: {
            type: "textarea",
            value: "Don't love it? Don't worry. Return delivery is free.",
          },
        },
      },
      {
        name: "t:resource.sections.trust_marker.trust_marker",
        props: {
          marker_heading: {
            type: "text",
            value: "Secure Payments",
          },
          marker_description: {
            type: "textarea",
            value: "Don't love it? Don't worry. Return delivery is free.",
          },
        },
      },
      {
        name: "t:resource.sections.trust_marker.trust_marker",
        props: {
          marker_heading: {
            type: "text",
            value: "5.0 star rating",
          },
          marker_description: {
            type: "textarea",
            value: "Don't love it? Don't worry. Return delivery is free.",
          },
        },
      },
    ],
  },
};
export default Component;
