import React, { useMemo } from "react";
import Slider from "react-slick";
import styles from "../styles/trust-marker.less";
import FyImage from "fdk-react-templates/components/core/fy-image/fy-image";
import "fdk-react-templates/components/core/fy-image/fy-image.css";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import { FDKLink } from "fdk-core/components";

export function Component({ props, globalConfig, blocks, preset }) {
  const {
    title: { value: title },
    description: { value: description },
    desktop_layout: { value: desktopLayout },
    mobile_layout: { value: mobileLayout },
    per_row_desktop: { value: perRowDesktop },
    per_row_mobile: { value: perRowMobile },
    card_background: { value: cardBackground },
  } = props;

  const getTrustMarker = useMemo(
    () => (blocks.length === 0 ? preset?.blocks || [] : blocks),
    [blocks, preset]
  );

  const isStackView = desktopLayout === "grid" || mobileLayout === "grid";
  const isHorizontalView =
    desktopLayout === "horizontal" || mobileLayout === "horizontal";

  const dynamicStyles = {
    "--img-background-color": cardBackground || globalConfig?.img_container_bg,
  };

  return (
    <section className={styles.sectionContainer} style={dynamicStyles}>
      <div className={styles.headingContainer}>
        {!!title && (
          <h2 className={`${styles.sectionTitle} fontHeader`}>{title}</h2>
        )}
        {!!description && (
          <p className={`${styles.sectionDescription} bSmall`}>{description}</p>
        )}
      </div>
      {isStackView && (
        <StackLayout
          className={`${
            desktopLayout === "horizontal" ? styles.desktopHidden : ""
          } ${mobileLayout === "horizontal" ? styles.mobileHidden : ""}`}
          trustMarker={getTrustMarker}
          globalConfig={globalConfig}
          colCount={Number(perRowDesktop)}
          colCountMobile={Number(perRowMobile)}
        />
      )}
      {isHorizontalView && (
        <HorizontalLayout
          className={`${desktopLayout === "grid" ? styles.desktopHidden : ""} ${
            mobileLayout === "grid" ? styles.mobileHidden : ""
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
        <Trustmark
          key={i}
          markerTitle={props?.marker_heading?.value}
          markerDescription={props?.marker_description?.value}
          markerLogo={props?.marker_logo?.value}
          markerLink={props?.marker_link?.value}
          globalConfig={globalConfig}
        />
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
          breakpoint: 1440,
          settings: {
            centerPadding: "75px",
          },
        },
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
            centerPadding: "50px",
          },
        },
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            centerPadding: "64px",
          },
        },
        {
          breakpoint: 480,
          settings: {
            dots: trustMarker?.length > Number(colCountMobile),
            arrows: false,
            infinite: trustMarker?.length > Number(colCountMobile),
            slidesToShow: Number(colCountMobile),
            slidesToScroll: Number(colCountMobile),
            // centerMode: trustMarker.length !== 1,
            centerPadding: "50px",
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
      <Slider
        className={`${trustMarker?.length - 1 >= colCount ? "" : "no-nav"} ${trustMarker?.length - 1 >= colCountMobile ? "" : "no-nav-mobile"} ${styles.hideOnMobile}`}
        {...slickSetting}
      >
        {trustMarker?.map(({ props }, i) => (
          <Trustmark
            key={i}
            markerTitle={props?.marker_heading?.value}
            markerDescription={props?.marker_description?.value}
            markerLogo={props?.marker_logo?.value}
            markerLink={props?.marker_link?.value}
            globalConfig={globalConfig}
          />
        ))}
      </Slider>
      <Slider
        className={`${trustMarker?.length - 1 >= colCount ? "" : "no-nav"} ${trustMarker?.length - 1 >= colCountMobile ? "" : "no-nav-mobile"} ${styles.hideOnDesktop}`}
        {...slickSettingMobile}
      >
        {trustMarker?.map(({ props }, i) => (
          <Trustmark
            key={i}
            markerTitle={props?.marker_heading?.value}
            markerDescription={props?.marker_description?.value}
            markerLogo={props?.marker_logo?.value}
            markerLink={props?.marker_link?.value}
            globalConfig={globalConfig}
          />
        ))}
      </Slider>
    </div>
  );
};

const Trustmark = ({
  className = "",
  markerLink,
  markerLogo,
  markerTitle,
  markerDescription,
  globalConfig,
}) => {
  return (
    <FDKLink to={markerLink} className={`${styles.trustmark} ${className}`}>
      {markerLogo && (
        <FyImage
          customClass={styles.trustmarkImage}
          sources={globalConfig?.img_hd ? [] : [{ width: 200 }]}
          backgroundColor={globalConfig?.img_container_bg}
          src={markerLogo}
          isFixedAspectRatio={false}
        />
      )}
      <div className={styles.trustmarkData}>
        {!!markerTitle && (
          <span
            className={`${styles.trustmarkHeading} captionSemiBold fontHeader`}
          >
            {markerTitle}
          </span>
        )}
        {!!markerDescription && (
          <span className={`${styles.trustmarkDescription} bSmall`}>
            {markerDescription}
          </span>
        )}
      </div>
    </FDKLink>
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
            default: "Don’t love it? Don’t worry. Return delivery is free.",
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