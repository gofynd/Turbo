import React, { useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import Slider from "react-slick";
import styles from "../styles/sections/image-gallery.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderImage from "../assets/images/placeholder/image-gallery.png";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";

export function Component({ props, blocks = [], globalConfig = {}, preset }) {
  const {
    autoplay: { value: autoplay } = {},
    play_slides: { value: playSlides } = {},
    title: { value: title } = {},
    description: { value: description } = {},
    desktop_layout: { value: desktopLayout } = {},
    item_count = {},
    mobile_layout: { value: mobileLayout } = {},
    item_count_mobile = {},
    card_radius: { value: cardRadius } = {},
  } = props;

  const itemCount = Number(item_count?.value ?? 5);
  const itemCountMobile = Number(item_count_mobile?.value ?? 2);

  const galleryItems = blocks?.length ? blocks : preset?.blocks || [];

  const isStackView = desktopLayout === "grid" || mobileLayout === "grid";
  const isHorizontalView =
    desktopLayout === "horizontal" || mobileLayout === "horizontal";

  const getImgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: Math.round(3564 / itemCount) },
      { breakpoint: { min: 1512 }, width: Math.round(3132 / itemCount) },
      { breakpoint: { min: 1296 }, width: Math.round(2700 / itemCount) },
      { breakpoint: { min: 1080 }, width: Math.round(2250 / itemCount) },
      { breakpoint: { min: 900 }, width: Math.round(1890 / itemCount) },
      { breakpoint: { min: 720 }, width: Math.round(1530 / itemCount) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / itemCountMobile) },
      { breakpoint: { min: 360 }, width: Math.round(810 / itemCountMobile) },
      { breakpoint: { min: 180 }, width: Math.round(450 / itemCountMobile) },
    ];
  }, [globalConfig?.img_hd, itemCount, itemCountMobile]);

  return (
    <div
      style={{
        paddingTop: "16px",
        maxWidth: "100vw",
        paddingBottom: `16px`,
        "--bd-radius": `${(cardRadius || 0) / 2}%`,
      }}
    >
      <div>
        <div className={styles.titleBlock}>
          {title && (
            <h2 className={`${styles.sectionHeading} fontHeader`}>{title}</h2>
          )}
          {description && (
            <p className={`${styles.description} b2`}>{description}</p>
          )}
        </div>
        {isHorizontalView && (
          <HorizontalLayout
            items={galleryItems}
            globalConfig={globalConfig}
            colCount={itemCount}
            colCountMobile={itemCountMobile}
            sources={getImgSrcSet}
            autoplay={autoplay}
            autoplaySpeed={playSlides * 1000}
            desktopLayout={desktopLayout}
            mobileLayout={mobileLayout}
          />
        )}
        {isStackView && (
          <StackLayout
            items={galleryItems}
            globalConfig={globalConfig}
            colCount={itemCount}
            colCountMobile={itemCountMobile}
            sources={getImgSrcSet}
            desktopLayout={desktopLayout}
            mobileLayout={mobileLayout}
          />
        )}
      </div>
    </div>
  );
}

const StackLayout = ({
  items,
  globalConfig,
  colCount,
  colCountMobile,
  sources,
  desktopLayout,
  mobileLayout,
}) => {
  const dynamicStyles = {
    "--item-count": `${colCount}`,
    "--item-count-mobile": `${colCountMobile}`,
  };

  return (
    <div
      className={`${styles.imageGrid} ${
        desktopLayout === "grid" ? styles.desktopVisible : styles.desktopHidden
      } ${
        mobileLayout === "grid" ? styles.mobileVisible : styles.mobileHidden
      }`}
      style={dynamicStyles}
    >
      {items.map(({ props: block }, index) => (
        <div key={index}>
          <FDKLink to={block?.link?.value || ""}>
            <FyImage
              customClass={styles.imageGallery}
              src={block?.image?.value || placeholderImage}
              sources={sources}
              globalConfig={globalConfig}
              isFixedAspectRatio={false}
            />
          </FDKLink>
        </div>
      ))}
    </div>
  );
};

const HorizontalLayout = ({
  items,
  globalConfig,
  colCount,
  colCountMobile,
  sources,
  autoplay,
  autoplaySpeed,
  desktopLayout,
  mobileLayout,
}) => {
  const config = useMemo(
    () => ({
      dots: items.length > colCount,
      arrows: items?.length > colCount,
      infinite: items?.length > colCount,
      speed: 500,
      slidesToShow: colCount,
      slidesToScroll: colCount,
      swipeToSlide: true,
      autoplay,
      autoplaySpeed,
      cssEase: "linear",
      // arrows: getGallery.length > item_count?.value || false,
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            arrows: false,
            slidesToShow: colCount,
            slidesToScroll: colCount,
            swipe: true,
            swipeToSlide: false,
            touchThreshold: 80,
            draggable: false,
            touchMove: true,
          },
        },
      ],
    }),
    [colCount, colCountMobile, autoplay, autoplaySpeed]
  );
  const configMobile = useMemo(
    () => ({
      dots: true,
      arrows: false,
      infinite: items?.length > colCountMobile,
      slidesToShow: colCountMobile,
      slidesToScroll: colCountMobile,
      speed: 500,
      autoplay,
      autoplaySpeed,
      cssEase: "linear",
      centerMode: false,
      centerPadding: "25px",
      swipe: true,
      swipeToSlide: false,
      touchThreshold: 80,
      draggable: false,
      touchMove: true,
      // arrows: getGallery.length > item_count?.value || false,
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
    }),
    [colCount, colCountMobile, autoplay, autoplaySpeed]
  );

  return (
    <div
      className={`${styles.slideWrap} ${
        desktopLayout === "horizontal"
          ? styles.desktopVisible
          : styles.desktopHidden
      } ${
        mobileLayout === "horizontal"
          ? styles.mobileVisible
          : styles.mobileHidden
      }`}
      style={{
        "--slick-dots": `${Math.ceil(items?.length / colCount) * 22 + 10}px`,
        maxWidth: "100vw",
      }}
    >
      <Slider
        {...config}
        className={`${items?.length / colCount === 0 || items?.length < colCount ? "no-nav" : ""} ${styles.customSlider}  ${styles.hideOnMobile}`}
      >
        {items.map(({ props: block }, index) => (
          <div key={index} className={styles.sliderView}>
            <FDKLink to={block?.link?.value || ""}>
              <FyImage
                customClass={styles.imageGallery}
                src={block?.image?.value || placeholderImage}
                sources={sources}
                globalConfig={globalConfig}
                isFixedAspectRatio={false}
              />
            </FDKLink>
          </div>
        ))}
      </Slider>
      <Slider
        {...configMobile}
        className={`${items?.length / colCount === 0 || items?.length < colCount ? "no-nav" : ""} ${styles.customSlider} ${styles.hideOnDesktop}`}
      >
        {items.map(({ props: block }, index) => (
          <div key={index} className={styles.sliderView}>
            <FDKLink to={block?.link?.value || ""}>
              <FyImage
                customClass={styles.imageGallery}
                src={block?.image?.value || placeholderImage}
                sources={sources}
                globalConfig={globalConfig}
                isFixedAspectRatio={false}
              />
            </FDKLink>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export const settings = {
  label: "Image Gallery",
  props: [
    {
      type: "text",
      id: "title",
      default: "Customize Your Style",
      label: "Heading",
    },
    {
      type: "text",
      id: "description",
      default:
        "This flexible gallery lets you highlight key products and promotions, guiding customers to the right places.",
      label: "Description",
    },
    {
      type: "range",
      id: "card_radius",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      label: "Card Radius",
      default: 0,
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
      label: "Desktop Layout",
      info: "Items per row should be less than number of blocks to show horizontal scroll",
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 10,
      step: 1,
      unit: "",
      label: "Items per row (Desktop)",
      default: 5,
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
          text: "Horizontal scroll ",
        },
      ],
      default: "grid",
      label: "Mobile Layout",
      info: "Alignment of content",
    },
    {
      type: "range",
      id: "item_count_mobile",
      min: 1,
      max: 5,
      step: 1,
      unit: "",
      label: "Items per row (Mobile)",
      default: 2,
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "Auto Play Slides",
    },
    {
      type: "range",
      id: "play_slides",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "Change slides every",
      default: 3,
    },
  ],
  blocks: [
    {
      name: "Image card",
      type: "gallery",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Image",
          default: "",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "url",
          id: "link",
          label: "Redirect",
          default: "",
          info: "Search Link Type",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Image card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "Image card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "Image card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "Image card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
    ],
  },
};
export default Component;
