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
  label: "Trust Marker",
  props: [
    {
      type: "text",
      id: "title",
      default: "Title ",
      label: "Heading",
    },
    {
      type: "text",
      id: "description",
      default: "Add description",
      label: "Description",
    },
    {
      type: "color",
      id: "card_background",
      label: "Card Background Color",
      info: "This color will be used as card background",
      default: "",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal scroll",
        },
      ],
      default: "horizontal",
      label: "Desktop/Tablet Layout",
      info: "Alignment of content",
    },
    {
      type: "range",
      id: "per_row_desktop",
      label: "Display column per row (desktop/Tablet)",
      min: "3",
      max: "10",
      step: "1",
      info: "It'll not work for mobile layout",
      default: "5",
    },
    {
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal scroll",
        },
      ],
      default: "horizontal",
      label: "Mobile Layout",
      info: "Alignment of content",
    },
    {
      type: "range",
      id: "per_row_mobile",
      label: "Display column per row (Mobile)",
      min: "1",
      max: "5",
      step: "1",
      info: "It'll not work for desktop layout",
      default: "2",
    },
  ],
  blocks: [
    {
      type: "trustmarker",
      name: "Trust Marker",
      props: [
        {
          type: "image_picker",
          id: "marker_logo",
          default: "",
          label: "Icon",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "text",
          id: "marker_heading",
          default: "Free Delivery",
          label: "Heading",
        },
        {
          type: "text",
          id: "marker_description",
          default: "Don`t love it? Don`t worry. Return delivery is free.",
          label: "Description",
        },
        {
          type: "url",
          id: "marker_link",
          default: "",
          label: "Redirect link",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Trust Marker",
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
        name: "Trust Marker",
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
        name: "Trust Marker",
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
        name: "Trust Marker",
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
        name: "Trust Marker",
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
