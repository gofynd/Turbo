import loadable from '@loadable/component';
import React from "react";

const ApplicationBannerSectionChunk = loadable(() => import(/* webpackChunkName:"ApplicationBannerSectionChunk" */ './application-banner.jsx'));

const BlogSectionChunk = loadable(() => import(/* webpackChunkName:"BlogSectionChunk" */ './blog.jsx'));

const BrandListingSectionChunk = loadable(() => import(/* webpackChunkName:"BrandListingSectionChunk" */ './brand-listing.jsx'));

const BrandsLandingSectionChunk = loadable(() => import(/* webpackChunkName:"BrandsLandingSectionChunk" */ './brands-landing.jsx'));

const CartItemsSectionChunk = loadable(() => import(/* webpackChunkName:"CartItemsSectionChunk" */ './cart-items.jsx'));

const CartLandingSectionChunk = loadable(() => import(/* webpackChunkName:"CartLandingSectionChunk" */ './cart-landing.jsx'));

const CategoriesListingSectionChunk = loadable(() => import(/* webpackChunkName:"CategoriesListingSectionChunk" */ './categories-listing.jsx'));

const CategoriesSectionChunk = loadable(() => import(/* webpackChunkName:"CategoriesSectionChunk" */ './categories.jsx'));

const CheckoutSectionChunk = loadable(() => import(/* webpackChunkName:"CheckoutSectionChunk" */ './checkout.jsx'));

const CollectionListingSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionListingSectionChunk" */ './collection-listing.jsx'));

const CollectionsListingSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionsListingSectionChunk" */ './collections-listing.jsx'));

const CollectionsSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionsSectionChunk" */ './collections.jsx'));

const ContactUsSectionChunk = loadable(() => import(/* webpackChunkName:"ContactUsSectionChunk" */ './contact-us.jsx'));

const FeatureBlogSectionChunk = loadable(() => import(/* webpackChunkName:"FeatureBlogSectionChunk" */ './feature-blog.jsx'));

const FeaturedCollectionSectionChunk = loadable(() => import(/* webpackChunkName:"FeaturedCollectionSectionChunk" */ './featured-collection.jsx'));

const HeroImageSectionChunk = loadable(() => import(/* webpackChunkName:"HeroImageSectionChunk" */ './hero-image.jsx'));

const HeroVideoSectionChunk = loadable(() => import(/* webpackChunkName:"HeroVideoSectionChunk" */ './hero-video.jsx'));

const ImageGallerySectionChunk = loadable(() => import(/* webpackChunkName:"ImageGallerySectionChunk" */ './image-gallery.jsx'));

const ImageSlideshowSectionChunk = loadable(() => import(/* webpackChunkName:"ImageSlideshowSectionChunk" */ './image-slideshow.jsx'));

const LinkSectionChunk = loadable(() => import(/* webpackChunkName:"LinkSectionChunk" */ './link.jsx'));

const LoginSectionChunk = loadable(() => import(/* webpackChunkName:"LoginSectionChunk" */ './login.jsx'));

const MediaWithTextSectionChunk = loadable(() => import(/* webpackChunkName:"MediaWithTextSectionChunk" */ './media-with-text.jsx'));

const MultiCollectionProductListSectionChunk = loadable(() => import(/* webpackChunkName:"MultiCollectionProductListSectionChunk" */ './multi-collection-product-list.jsx'));

const OrderDetailsSectionChunk = loadable(() => import(/* webpackChunkName:"OrderDetailsSectionChunk" */ './order-details.jsx'));

const ProductDescriptionSectionChunk = loadable(() => import(/* webpackChunkName:"ProductDescriptionSectionChunk" */ './product-description.jsx'));

const ProductListingSectionChunk = loadable(() => import(/* webpackChunkName:"ProductListingSectionChunk" */ './product-listing.jsx'));

const RawHtmlSectionChunk = loadable(() => import(/* webpackChunkName:"RawHtmlSectionChunk" */ './raw-html.jsx'));

const RegisterSectionChunk = loadable(() => import(/* webpackChunkName:"RegisterSectionChunk" */ './register.jsx'));

const SiteMapSectionChunk = loadable(() => import(/* webpackChunkName:"SiteMapSectionChunk" */ './site-map.jsx'));

const TestimonialsSectionChunk = loadable(() => import(/* webpackChunkName:"TestimonialsSectionChunk" */ './testimonials.jsx'));

const TrustMarkerSectionChunk = loadable(() => import(/* webpackChunkName:"TrustMarkerSectionChunk" */ './trust-marker.jsx'));


const getbundle = (type) => {
        switch(type) {
            case 'application-banner':
            return (props) => <ApplicationBannerSectionChunk {...props}/>;
        case 'blog':
            return (props) => <BlogSectionChunk {...props}/>;
        case 'brand-listing':
            return (props) => <BrandListingSectionChunk {...props}/>;
        case 'brands-landing':
            return (props) => <BrandsLandingSectionChunk {...props}/>;
        case 'cart-items':
            return (props) => <CartItemsSectionChunk {...props}/>;
        case 'cart-landing':
            return (props) => <CartLandingSectionChunk {...props}/>;
        case 'categories-listing':
            return (props) => <CategoriesListingSectionChunk {...props}/>;
        case 'categories':
            return (props) => <CategoriesSectionChunk {...props}/>;
        case 'checkout':
            return (props) => <CheckoutSectionChunk {...props}/>;
        case 'collection-listing':
            return (props) => <CollectionListingSectionChunk {...props}/>;
        case 'collections-listing':
            return (props) => <CollectionsListingSectionChunk {...props}/>;
        case 'collections':
            return (props) => <CollectionsSectionChunk {...props}/>;
        case 'contact-us':
            return (props) => <ContactUsSectionChunk {...props}/>;
        case 'feature-blog':
            return (props) => <FeatureBlogSectionChunk {...props}/>;
        case 'featured-collection':
            return (props) => <FeaturedCollectionSectionChunk {...props}/>;
        case 'hero-image':
            return (props) => <HeroImageSectionChunk {...props}/>;
        case 'hero-video':
            return (props) => <HeroVideoSectionChunk {...props}/>;
        case 'image-gallery':
            return (props) => <ImageGallerySectionChunk {...props}/>;
        case 'image-slideshow':
            return (props) => <ImageSlideshowSectionChunk {...props}/>;
        case 'link':
            return (props) => <LinkSectionChunk {...props}/>;
        case 'login':
            return (props) => <LoginSectionChunk {...props}/>;
        case 'media-with-text':
            return (props) => <MediaWithTextSectionChunk {...props}/>;
        case 'multi-collection-product-list':
            return (props) => <MultiCollectionProductListSectionChunk {...props}/>;
        case 'order-details':
            return (props) => <OrderDetailsSectionChunk {...props}/>;
        case 'product-description':
            return (props) => <ProductDescriptionSectionChunk {...props}/>;
        case 'product-listing':
            return (props) => <ProductListingSectionChunk {...props}/>;
        case 'raw-html':
            return (props) => <RawHtmlSectionChunk {...props}/>;
        case 'register':
            return (props) => <RegisterSectionChunk {...props}/>;
        case 'site-map':
            return (props) => <SiteMapSectionChunk {...props}/>;
        case 'testimonials':
            return (props) => <TestimonialsSectionChunk {...props}/>;
        case 'trust-marker':
            return (props) => <TrustMarkerSectionChunk {...props}/>;
            default:
                return null;
        }
    };


export default {
            'application-banner': { ...ApplicationBannerSectionChunk, Component: getbundle('application-banner') },
        'blog': { ...BlogSectionChunk, Component: getbundle('blog') },
        'brand-listing': { ...BrandListingSectionChunk, Component: getbundle('brand-listing') },
        'brands-landing': { ...BrandsLandingSectionChunk, Component: getbundle('brands-landing') },
        'cart-items': { ...CartItemsSectionChunk, Component: getbundle('cart-items') },
        'cart-landing': { ...CartLandingSectionChunk, Component: getbundle('cart-landing') },
        'categories-listing': { ...CategoriesListingSectionChunk, Component: getbundle('categories-listing') },
        'categories': { ...CategoriesSectionChunk, Component: getbundle('categories') },
        'checkout': { ...CheckoutSectionChunk, Component: getbundle('checkout') },
        'collection-listing': { ...CollectionListingSectionChunk, Component: getbundle('collection-listing') },
        'collections-listing': { ...CollectionsListingSectionChunk, Component: getbundle('collections-listing') },
        'collections': { ...CollectionsSectionChunk, Component: getbundle('collections') },
        'contact-us': { ...ContactUsSectionChunk, Component: getbundle('contact-us') },
        'feature-blog': { ...FeatureBlogSectionChunk, Component: getbundle('feature-blog') },
        'featured-collection': { ...FeaturedCollectionSectionChunk, Component: getbundle('featured-collection') },
        'hero-image': { ...HeroImageSectionChunk, Component: getbundle('hero-image') },
        'hero-video': { ...HeroVideoSectionChunk, Component: getbundle('hero-video') },
        'image-gallery': { ...ImageGallerySectionChunk, Component: getbundle('image-gallery') },
        'image-slideshow': { ...ImageSlideshowSectionChunk, Component: getbundle('image-slideshow') },
        'link': { ...LinkSectionChunk, Component: getbundle('link') },
        'login': { ...LoginSectionChunk, Component: getbundle('login') },
        'media-with-text': { ...MediaWithTextSectionChunk, Component: getbundle('media-with-text') },
        'multi-collection-product-list': { ...MultiCollectionProductListSectionChunk, Component: getbundle('multi-collection-product-list') },
        'order-details': { ...OrderDetailsSectionChunk, Component: getbundle('order-details') },
        'product-description': { ...ProductDescriptionSectionChunk, Component: getbundle('product-description') },
        'product-listing': { ...ProductListingSectionChunk, Component: getbundle('product-listing') },
        'raw-html': { ...RawHtmlSectionChunk, Component: getbundle('raw-html') },
        'register': { ...RegisterSectionChunk, Component: getbundle('register') },
        'site-map': { ...SiteMapSectionChunk, Component: getbundle('site-map') },
        'testimonials': { ...TestimonialsSectionChunk, Component: getbundle('testimonials') },
        'trust-marker': { ...TrustMarkerSectionChunk, Component: getbundle('trust-marker') },
        };