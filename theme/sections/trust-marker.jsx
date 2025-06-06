import React, { useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import Slider from "react-slick";
import styles from "../styles/trust-marker.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";

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
  const slickSetting = useMemo(() => {
    return {
      dots: trustMarker?.length > colCount,
      arrows: trustMarker?.length > colCount,
      focusOnSelect: true,
      infinite: trustMarker?.length > colCount,
      speed: 600,
      slidesToShow: Number(colCount),
      slidesToScroll: Number(colCount),
      autoplay: false,
      centerMode: false,
      centerPadding: trustMarker?.length === 1 ? "0" : "152px",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      responsive: [
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
          },
        },
      ],
    };
  }, [trustMarker, colCount, colCountMobile]);

  const slickSettingMobile = useMemo(() => {
    return {
      dots: trustMarker?.length > Number(colCountMobile),
      arrows: false,
      focusOnSelect: true,
      infinite: trustMarker?.length > Number(colCountMobile),
      speed: 600,
      slidesToShow: Number(colCountMobile),
      slidesToScroll: Number(colCountMobile),
      autoplay: false,
      centerMode: false,
      centerPadding: "50px",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
    };
  }, [trustMarker, colCount, colCountMobile]);

  return (
    <div
      className={`${styles.horizontalLayout} ${className}`}
      style={{
        "--slick-dots": `${Math.ceil(trustMarker?.length / colCount) * 22 + 10}px`,
      }}
    >
      <Slider className={`${styles.hideOnMobile}`} {...slickSetting}>
        {trustMarker?.map(({ props }, i) => (
          <Trustmark
            key={i}
            className={styles.horizontalItem}
            props={props}
            globalConfig={globalConfig}
          />
        ))}
      </Slider>
      <Slider className={`${styles.showOnMobile}`} {...slickSettingMobile}>
        {trustMarker?.map(({ props }, i) => (
          <Trustmark
            key={i}
            className={styles.horizontalItem}
            props={props}
            globalConfig={globalConfig}
          />
        ))}
      </Slider>
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