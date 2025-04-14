import React from "react";
import ProductListing from "@gofynd/theme-template/pages/product-listing/product-listing";
import "@gofynd/theme-template/pages/product-listing/index.css";
import useProductListing from "./useProductListing";
import Shimmer from "../../components/shimmer/shimmer";
import { isRunningOnClient } from "../../helper/utils";

const ProductListingPage = ({ fpi, props }) => {
  const listingProps = useProductListing({ fpi, props });

  if (isRunningOnClient() && listingProps?.isPageLoading) {
    return <Shimmer />;
  }

  return (
    <div className="margin0auto basePageContainer">
      <ProductListing {...listingProps} />
    </div>
  );
};

export default ProductListingPage;
