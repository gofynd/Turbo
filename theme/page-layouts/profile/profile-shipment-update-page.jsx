import React, { useCallback, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import OrdersHeader from "@gofynd/theme-template/components/order-header/order-header";
import "@gofynd/theme-template/components/order-header/order-header.css";
import ShipmentUpdateItem from "@gofynd/theme-template/components/shipments-update-item/shipments-update-item";
import "@gofynd/theme-template/components/shipments-update-item/shipments-update-item.css";
import BeneficiaryList from "@gofynd/theme-template/components/beneficiary-list/beneficiary-list";
import "@gofynd/theme-template/components/beneficiary-list/beneficiary-list.css";
import BeneficiaryItem from "@gofynd/theme-template/components/beneficiary-list/beneficiary-list-item/beneficiary-list-item";
import "@gofynd/theme-template/components/beneficiary-list/beneficiary-list-item/beneficiary-list-item.css";
import ReasonsList from "@gofynd/theme-template/components/reasons-list/reasons-list";
import "@gofynd/theme-template/components/reasons-list/reasons-list.css";
import ReasonItem from "@gofynd/theme-template/components/reasons-list/reason-item/reason-item";
import "@gofynd/theme-template/components/reasons-list/reason-item/reason-item.css";
import styles from "./styles/profile-shipment-update-page.less";
import useShipmentDetails from "../orders/useShipmentDetails";
import useRefundDetails from "../orders/useRefundDetails";
import { useSnackbar, useThemeConfig } from "../../helper/hooks";
import EmptyState from "../../components/empty-state/empty-state";
import Loader from "../../components/loader/loader";
import ProfileRoot from "../../components/profile/profile-root";
import AddPayment from "../../components/orders/add-payment";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
import {
  COMPLETE_MEDIA_UPLOAD,
  START_MEDIA_UPLOAD,
} from "../../queries/shipmentQuery";
import ArrowDropdownIcon from "../../assets/images/arrow-dropdown-black.svg";
import CrossContainedIcon from "../../assets/images/cross-contained-black.svg";
import { getGroupedShipmentBags } from "../../helper/utils";

function ProfileShipmentUpdatePage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { globalConfig } = useThemeConfig({ fpi });
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const DEFAULT_ERROR_TEXT = t("resource.common.error_message");
  const [updatedQty, setUpdatedQty] = useState(1);
  const [selectedBagId, setSelectedBagId] = useState("");
  const [extraComment, setExtraComment] = useState("");
  const [type, setType] = useState("");
  const [reasonList, setReasonsList] = useState([]);
  const [previewList, setPreviewList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [accordianlv1, setAccordianlv1] = useState({});
  const [selectedReason, setSelectedReason] = useState({});
  const [showReasonsAccordion, setShowReasonsAccordion] = useState({ 0: true });
  const [selectedBeneficary, setSelectedBeneficary] = useState(null);
  const [showBeneficiariesAccordion, setShowBeneficiariesAccordion] =
    useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState(
    t("resource.common.error_message")
  );
  const [reasonOtherText, setReasonOtherText] = useState("");
  const { showSnackbar } = useSnackbar();
  const {
    isLoading,
    shipmentDetails,
    reasonsList,
    getBagReasons,
    updateShipment,
  } = useShipmentDetails(fpi);
  const { refundDetails, getRefundDetails } = useRefundDetails(fpi);

  const queryParams = new URLSearchParams(location.search);
  const selected_bag_id = queryParams.get("selectedBagId") || "";
  const updateType = (cancelBtn) => {
    if (shipmentDetails) {
      if (shipmentDetails?.can_cancel) {
        if (cancelBtn === "cancelBtn") {
          return t("resource.facets.cancel");
        } else {
          return t("resource.profile.cancel_request");
        }
      } else if (shipmentDetails?.can_return) {
        if (cancelBtn === "cancelBtn") {
          return t("resource.facets.return");
        } else {
          return t("resource.profile.return_request");
        }
      }
      return "";
    }
  };
  useEffect(() => {
    if (shipmentDetails?.order_id) {
      getBagReasons({
        shipmentId: shipmentDetails?.shipment_id,
        bagId: selected_bag_id,
      });
      getRefundDetails(shipmentDetails?.order_id);
    }
    return () => {};
  }, [shipmentDetails?.order_id]);

  useEffect(() => {
    setAccordianlv1({
      0: reasonsList.reasons,
    });
    return () => {};
  }, [reasonsList]);

  const { bags, bundleGroups, bundleGroupArticles } = useMemo(() => {
    return getGroupedShipmentBags(shipmentDetails?.bags, {
      isPartialCheck: params?.type === "return",
    });
  }, [shipmentDetails?.bags, params?.type]);

  const getBag = useMemo(() => {
    if (!bags) {
      return [];
    }
    const selectedIdNum = Number(selected_bag_id);
    // 1) First check if the selected bag is part of a bundle group
    // Search in bundleGroups to identify which group contains the selected bag
    for (const [groupId, groupBags] of Object.entries(bundleGroups || {})) {
      // Ensure array
      const groupArr = Array.isArray(groupBags) ? groupBags : [];
      const matchedBag = groupArr.find((b) => b?.id === selectedIdNum);
      if (matchedBag) {
        // For non-partial return bundles, always return the base bag
        const baseBag =
          groupArr.find((b) => b?.bundle_details?.is_base) || matchedBag;
        return [
          {
            ...baseBag,
            bag_ids: [selected_bag_id],
          },
        ];
      }
    }

    // 2) If not found in bundle groups, try to find the bag directly
    const directMatch = bags.find((b) => b.id === selectedIdNum);
    if (directMatch) {
      return [
        {
          ...directMatch,
          bag_ids: [selected_bag_id],
        },
      ];
    }
    return [];
  }, [bags, bundleGroups, selected_bag_id]);

  // useEffect(() => {
  //   const item = getBag?.[0];
  //   if (item) {
  //     if (
  //       item.bundle_details?.bundle_group_id &&
  //       bundleGroups[item.bundle_details.bundle_group_id]
  //     ) {
  //       setUpdatedQty(item.bundle_details.bundle_count);
  //     } else {
  //       setUpdatedQty(item.quantity);
  //     }
  //   }
  // }, [getBag]);

  const updatedQuantity = (qty) => {
    setUpdatedQty(qty);
  };

  const onDontUpdate = () => {
    navigate(`/profile/orders/shipment/${shipmentDetails?.shipment_id}`);
  };
  const showimg = () => {
    return (
      selectedReason[selectLast()]?.reasons?.length === 0 &&
      getStatusForUpdate() === "return_pre_qc"
    );
  };

  const selectLast = () => {
    return Object.keys(selectedReason)[Object.keys(selectedReason).length - 1];
  };
  const getStatusForUpdate = () => {
    if (shipmentDetails?.can_cancel) {
      return "cancelled_customer";
    } else if (shipmentDetails?.can_return) {
      return selectedReason?.[selectLast()]?.qc_type?.includes?.("pre_qc")
        ? "return_pre_qc"
        : "return_initiated";
    }
  };
  const toggelAccordian = (idx, status) => {
    const obj = {};
    // explicitly close the accordian if close status is given
    if (status === "close") {
      obj[idx] = false;
    }
    // explicitly Open the accordian if open status is given
    else if (status === "open") {
      obj[idx] = true;
    }
    // Toggle accordian if status not given & Only one accordian will be open at a time
    else {
      for (const key in showReasonsAccordion) {
        if (+key === +idx) {
          obj[idx] = !showReasonsAccordion[idx];
        } else {
          obj[key] = false;
        }
      }
    }
    setShowReasonsAccordion((oldValue) => ({ ...oldValue, ...obj }));
  };
  const onReasonChange = (reason, idx) => {
    const listObj = deleteNext(accordianlv1, idx);
    if (reason?.reasons?.length > 0) {
      setAccordianlv1({
        ...listObj,
        [+idx + 1]: reason.reasons,
      });
    } else {
      setAccordianlv1({ ...listObj });
    }
    const selectObj = deleteNext(selectedReason, idx);

    setSelectedReason({
      ...selectObj,
      [+idx]: reason,
    });

    const obj = { ...showReasonsAccordion };

    // On Selecting reason close All past Accordian and open next Reason accordian
    // basically one accordian at a time will be opened.
    for (const key in obj) {
      if (+key < +idx + 1) {
        toggelAccordian(+key, "close");
      }
    }

    toggelAccordian(+idx + 1, "open");
  };

  const onOtherReason = (event, i) => {
    setSelectedReason((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        reason_other_text: event,
      },
    }));
  };
  const beneficiaryError = () => {
    return refundDetails?.user_beneficiaries_detail?.beneficiaries?.length > 0
      ? t("resource.profile.select_one_refund_option")
      : t("resource.profile.add_payment_method");
  };
  const showSuccess = (type) => {
    if (type === "payment") {
      getRefundDetails(shipmentDetails?.order_id);
    } else if (type === "refund") {
      redirectToOrders();
    }
    setType(type);
  };
  const getBeneficiaryDetails = () => {
    getRefundDetails(shipmentDetails?.order_id);
  };
  const onBeneficiariesChange = (beneficiary) => {
    setSelectedBeneficary(beneficiary);
  };

  const deleteNext = (obj, idx) => {
    const select = { ...obj };
    for (const key in select) {
      if (+key > +idx) {
        delete select[key];
      }
    }
    return select;
  };
  const buttondisable = useMemo(() => {
    const currentReason = selectedReason[selectLast()];
    if (
      currentReason?.meta?.remark_required &&
      !currentReason?.reason_other_text?.trim()
    ) {
      return true;
    }
    return shipmentDetails?.can_cancel
      ? !(selectLast() && !selectedReason[selectLast()].reasons?.length > 0)
      : !(
          selectLast() &&
          !selectedReason[selectLast()].reasons?.length > 0 &&
          (showimg() ? imageList.length > 0 : true)
        );
  }, [shipmentDetails, selectedReason, imageList]);

  const getUpdatedBagsList = () => {
    const arrBags = [];

    // for (let i = 0; i < getBag.length; i++) {
    //   if (refs?.current[i]?.getUpdatedBags())
    //     arrBags = arrBags.concat(refs?.current[i]?.getUpdatedBags());
    // }
    return arrBags;
  };
  const getProductDetails = () => {
    const bag = getBag?.[0];
    if (
      bag?.bundle_details?.bundle_group_id &&
      bundleGroups[bag.bundle_details.bundle_group_id]
    ) {
      const bundleReturnQty = updatedQty;
      const bundleBags = bundleGroups[bag.bundle_details.bundle_group_id];
      const bundleUniqueArticles = [
        ...(bundleGroupArticles?.[bag.bundle_details.bundle_group_id] || []),
      ];
      const articleReturnQuantity = bundleUniqueArticles.reduce(
        (acc, article) => {
          if (
            article?.bundle_details?.article_bundle_id &&
            article?.bundle_details?.bundle_article_quantity
          ) {
            acc.set(
              article.bundle_details.article_bundle_id,
              article.bundle_details.bundle_article_quantity * bundleReturnQty
            );
          }
          return acc;
        },
        new Map()
      );
      const returnBags = [];
      for (const bag of bundleBags) {
        if (
          bag?.bundle_details?.article_bundle_id &&
          articleReturnQuantity.has(bag.bundle_details.article_bundle_id)
        ) {
          const { bundle_details, line_number, seller_identifier, quantity } =
            bag;
          const returnQty = articleReturnQuantity.get(
            bundle_details.article_bundle_id
          );
          const remainQty = returnQty - quantity;
          if (remainQty >= 0) {
            articleReturnQuantity.set(
              bundle_details.article_bundle_id,
              remainQty
            );
            returnBags.push({
              quantity,
              line_number,
              identifier: seller_identifier,
            });
          } else {
            returnBags.push({
              quantity: returnQty,
              line_number,
              identifier: seller_identifier,
            });
            articleReturnQuantity.delete(bundle_details.article_bundle_id);
          }
        }
        if (!articleReturnQuantity.size) break;
      }
      return returnBags;
    }
    const quantity = updatedQty;
    const line_number = getBag?.[0].line_number;
    const identifier = getBag?.[0].seller_identifier;
    const productsArr = [{ quantity, line_number, identifier }];
    return productsArr;
  };

  const getUpdateConfigParams = (reason, cdn_urls) => {
    const getProducts = getProductDetails();

    if (shipmentDetails?.can_cancel) {
      return {
        shipmentId: shipmentDetails?.shipment_id,
        updateShipmentStatusRequestInput: {
          force_transition: true,

          statuses: [
            {
              shipments: [
                {
                  identifier: shipmentDetails?.shipment_id,
                  products: getProducts,
                  reasons: {
                    products: [
                      {
                        data: {
                          reason_id: reason[selectLast()]?.id,
                          reason_text:
                            reason[selectLast()]?.reason_other_text ||
                            reasonOtherText,
                        },
                        filters: getProducts,
                      },
                    ],
                  },
                },
              ],
              status: "cancelled_customer",
            },
          ],
        },
        order_id: shipmentDetails?.order_id,
        products: getProducts,
        selected_reason: { ...reason[selectLast()] },
        // other_reason_text: extraComment,
      };
    } else {
      return {
        shipmentId: shipmentDetails?.shipment_id,
        updateShipmentStatusRequestInput: {
          force_transition: true,

          statuses: [
            {
              shipments: [
                {
                  data_updates: {
                    products: [
                      {
                        data: {
                          meta: {
                            return_qc_json: {
                              images: cdn_urls,
                              return_reason: { ...reason[selectLast()] },
                            },
                          },
                        },
                      },
                    ],
                  },
                  identifier: shipmentDetails?.shipment_id,
                  products: getProducts,
                  reasons: {
                    products: [
                      {
                        data: {
                          reason_id: reason[selectLast()]?.id,
                          reason_text:
                            reason[selectLast()]?.reason_other_text ||
                            reasonOtherText,
                        },
                        filters: getProducts,
                      },
                    ],
                  },
                },
              ],
              status: getStatusForUpdate(),
            },
          ],
        },
        shimpment_id: shipmentDetails?.shipment_id,
        order_id: shipmentDetails?.order_id,
        selected_reason: { ...reason[selectLast()] },
        // other_reason_text: extraComment,
        beneficiary_id: refundDetails?.user_beneficiaries_detail
          ?.show_beneficiary_details
          ? selectedBeneficary?.beneficiary_id
          : "",
        qc_image_urls: cdn_urls,
        products: getProducts,
      };
    }
  };

  const setUpdatedOrders = (obj) => {
    setInProgress(true);
    if (shipmentDetails?.can_cancel) {
      updateShipment(obj, "cancel");
    }
    if (shipmentDetails?.can_return) {
      updateShipment(obj, "return");
    }
  };
  const redirectToOrders = () => {
    navigate(`/profile/orders?selected_date_filter=730`);
  };
  const showUpdateErrorText = (text) => {
    setConfirmReturn(false);
    setUpdateError(true);
    setInProgress(false);
    window.scrollTo(0, 0);
    if (text) {
      showSnackbar(text.toString(), "error");
    } else {
      showSnackbar(DEFAULT_ERROR_TEXT, "error");
    }
  };
  const onUpdate = async () => {
    let cdnUrls = [];

    if (getStatusForUpdate() === "return_pre_qc") {
      const images = imageList.filter((item) =>
        ["image/png", "image/jpg", "image/jpeg"].includes(item.type)
      );
      const videos = imageList.filter((item) =>
        ["video/quicktime", "video/mp4"].includes(item.type)
      );
      if (images.length > 4)
        return showUpdateErrorText(
          t("resource.profile.max_4_images_allowed_upload")
        );
      if (videos.length > 1)
        return showUpdateErrorText(
          t("resource.profile.max_1_video_allowed_upload")
        );
      if (images.length < 2)
        return showUpdateErrorText(
          t("resource.profile.min_2_images_required_upload")
        );

      const filesizecheck = images.every((item) => item.size / 1000 < 5000);

      if (!filesizecheck)
        return showUpdateErrorText(t("resource.profile.image_size_max_5mb"));
      if (videos?.length) {
        const filesizecheckvideo = videos.every(
          (item) => item.size / 1000 < 25000
        );

        if (!filesizecheckvideo)
          return showUpdateErrorText(t("resource.profile.video_size_max_25mb"));
      }

      const filetype = imageList.every((item) =>
        [
          "image/png",
          "image/jpg",
          "image/jpeg",
          "video/quicktime",
          "video/mp4",
        ].includes(item.type)
      );
      if (!filetype)
        return showUpdateErrorText(
          t("resource.profile.valid_file_formats_required")
        );
    }

    // if (!confirmReturn) {
    //   setConfirmReturn(true);
    //   return;
    // }
    if (getStatusForUpdate() === "return_pre_qc") {
      setInProgress(true);
      const startUploadResponse = await Promise.all(
        imageList.map((item) => {
          return fpi.executeGQL(START_MEDIA_UPLOAD, {
            startUploadReqInput: {
              file_name: item.name,
              content_type: item.type,
              size: item.size,
            },
            namespace: "misc",
          });
        })
      );

      await Promise.all(
        startUploadResponse.map((mediaObj, index) => {
          const item = mediaObj.data?.startUpload || {};

          return fetch(item.upload?.url, {
            method: item.method,
            body: imageList[index].file,
            headers: {
              "Content-Type": item.content_type,
            },
          });
        })
      );

      const completeUploadResponse = await Promise.all(
        startUploadResponse.map((mediaObj) => {
          const item = mediaObj.data?.startUpload || {};

          return fpi.executeGQL(COMPLETE_MEDIA_UPLOAD, {
            completeUploadReqInput: {
              file_name: item.file_name,
              file_path: item.file_path,
              content_type: item.content_type,
              method: item.method,
              namespace: item.namespace,
              operation: item.operation,
              size: item.size,
              upload: item.upload,
            },
            namespace: "misc", // Storage location
          });
        })
      );

      setInProgress(false);
      cdnUrls = completeUploadResponse.map((item) => {
        return { desc: "", url: item.data?.completeUpload?.cdn?.url };
      });
    }

    const reason = selectedReason;
    // let updateBags = getUpdatedBagsList();
    // if (updateBags.length === 0) {
    //   return showUpdateErrorText("No Items to return");
    // } else
    if (
      reason[0]?.display_name === "Others" &&
      reason[0]?.reason_other_text?.length <= 0
    ) {
      return showUpdateErrorText(
        t("resource.profile.write_reason_for_cancellation")
      );
    } else if (!reason) {
      return showUpdateErrorText(t("resource.profile.select_one_reason_below"));
    } else if (
      !selectedBeneficary &&
      shipmentDetails?.can_return &&
      shipmentDetails?.beneficiary_details &&
      refundDetails?.user_beneficiaries_detail?.show_beneficiary_details
    ) {
      return showUpdateErrorText(beneficiaryError());
    }

    const config = getUpdateConfigParams(reason, cdnUrls);
    setUpdatedOrders(config);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    if (!files?.length) return;

    let showFileExistError = false;

    const newFiles = files
      .map((file) => {
        const fileExists = imageList.some(
          (uploadedFile) => uploadedFile.name === file.name
        );

        if (fileExists) {
          showFileExistError = true;
          return null;
        }

        return {
          id: Date.now() + file.name, // Unique ID for each file
          name: file.name,
          type: file.type,
          size: file.size,
          preview: URL.createObjectURL(file),
          file,
        };
      })
      .filter((file) => file);

    setImageList((prevList) => [...prevList, ...newFiles]);

    if (showFileExistError) {
      showSnackbar("File already exists", "error");
    }

    event.target.value = null;
  };

  const handleRemoveFile = (id) => {
    // Revoke URL for the removed file to free memory
    const removedFile = imageList.find((file) => file.id === id);
    if (removedFile) URL.revokeObjectURL(removedFile.preview);

    setImageList((prevList) => prevList.filter((file) => file.id !== id));
  };

  return (
    <ProfileRoot fpi={fpi}>
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          className="basePageContainer"
        >
          {!shipmentDetails && (
            <div className={`${styles.error} ${styles.shipment}`}>
              <EmptyState></EmptyState>
            </div>
          )}
          {shipmentDetails && (
            <div className={` ${styles.shipment}`}>
              {shipmentDetails && (
                <OrdersHeader
                  flag={true}
                  title={`${updateType()}`}
                  customClassName={styles.headerWidth}
                ></OrdersHeader>
              )}
              {getBag?.map(
                (item, index) => (
                  <ShipmentUpdateItem
                    key={`shipment_item${index}`}
                    quantity={updatedQty}
                    selectedBagId={selected_bag_id}
                    updatedQuantity={(e) => updatedQuantity(e)}
                    item={item}
                    bundleGroups={bundleGroups}
                    bundleGroupArticles={bundleGroupArticles}
                    globalConfig={globalConfig}
                  ></ShipmentUpdateItem>
                )
                //   }
              )}
              {/* <div className={`${styles.divider}`}></div> */}
              <div className={`${styles.reasonsList}`}>
                {Object.values(accordianlv1).map((item, i) => (
                  <div
                    className={`${styles.accordion} ${styles.borderBottom}`}
                    key={i}
                  >
                    <div
                      className={`${styles.accordion} ${styles.accordion__header}`}
                      onClick={() => {
                        if (item?.length > 1) toggelAccordian(i);
                      }}
                    >
                      <OrdersHeader
                        flag={true}
                        className={`${styles.refundTitle}`}
                        customClassName={`${styles.headerWidth} ${styles.unsetPadding}`}
                        title={
                          i === 0
                            ? `${t("resource.profile.reason_for")} ${updateType()?.toLowerCase()}`
                            : t("resource.profile.more_details")
                        }
                      ></OrdersHeader>
                      {item?.length > 1 && (
                        <ArrowDropdownIcon
                          className={`${showReasonsAccordion[i] ? styles.rotate : ""} ${styles.animate}`}
                        />
                      )}
                    </div>
                    {showReasonsAccordion[i] && (
                      <ReasonsList
                        reasons={item}
                        change={(e) => onReasonChange(e, i)}
                        selectedReason={selectedReason[i]}
                        otherReason={(e) => onOtherReason(e, i)}
                      ></ReasonsList>
                    )}
                    {selectedReason[i]?.id && !showReasonsAccordion[i] && (
                      <div className={`${styles.selectedReason}`}>
                        <ReasonItem
                          reason={selectedReason[i]}
                          selectedReason={selectedReason[i]}
                          otherReason={(e) => onOtherReason(e, i)}
                        ></ReasonItem>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {shipmentDetails?.beneficiary_details &&
                shipmentDetails?.can_return &&
                refundDetails?.user_beneficiaries_detail
                  ?.show_beneficiary_details && (
                  <div>
                    <div className={styles.refundOption}>
                      {t("resource.profile.select_refund_option")}
                    </div>
                    {/* <ukt-accordion> */}
                    <div>
                      <BeneficiaryList
                        className={`${styles.beneficiaryList}`}
                        beneficiaries={
                          refundDetails?.user_beneficiaries_detail
                            ?.beneficiaries || []
                        }
                        change={onBeneficiariesChange}
                        selectedBeneficiary={selectedBeneficary}
                      ></BeneficiaryList>
                      {shipmentDetails && (
                        <AddPayment
                          shipment={shipmentDetails}
                          fpi={fpi}
                          getBeneficiaryDetails={getBeneficiaryDetails}
                        ></AddPayment>
                      )}
                    </div>
                    {/* // </ukt-accordion> */}
                    {/* {selectedBeneficary && (
                    <BeneficiaryItem
                      beneficiary={selectedBeneficary}
                      selectedBeneficiary={selectedBeneficary}
                    ></BeneficiaryItem>
                  )} */}
                  </div>
                )}
              {shipmentDetails?.beneficiary_details &&
                shipmentDetails?.can_return &&
                refundDetails?.user_beneficiaries_detail
                  ?.show_beneficiary_details && (
                  <div className={`${styles.divider}`}></div>
                )}
              {showimg() && (
                <div className={`${styles.cancelimg}`}>
                  <div className={`${styles.header} ${styles.boldmd}`}>
                    {t("resource.profile.add_product_images")}
                  </div>
                  <div className={`${styles.addPhoto} ${styles.boldmd}`}>
                    {/* <SvgWrapper svgSrc="add-photo" /> */}
                    <label className={`${styles.addImg}`} htmlFor="my-file">
                      {t("resource.profile.add_images_videos")}
                      <input
                        type="file"
                        accept="video/*, image/*"
                        multiple="multiple"
                        onChange={handleFileUpload}
                        className={`${styles.formControlFile}`}
                        id="my-file"
                      />
                    </label>

                    <ul className={styles.fileList}>
                      {imageList.map((file) => (
                        <li key={file.id} className={styles.fileItem}>
                          {file.type.includes("image") ? (
                            <img
                              className={styles.uploadedImage}
                              src={file.preview}
                              alt={file.name}
                            />
                          ) : (
                            <video
                              className={styles.uploadedImage}
                              src={file.preview}
                            />
                          )}
                          <span
                            className={styles.cancel}
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <CrossContainedIcon />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.makesure}`}>
                    {t("resource.profile.ensure_product_tag_visible")}
                  </div>
                  <div className={`${styles.accept}`}>
                    {t("resource.profile.accepted_image_formats_and_size")}
                  </div>
                  <div className={`${styles.accept}`}>
                    {t("resource.profile.accepted_video_formats_and_size")}
                  </div>
                  {previewList.length > 0 && (
                    <div className={`${styles.previewImg}`}>
                      {previewList?.map((item, index) => (
                        <div key={index}>
                          <span></span>
                          {item.includes("data:video") && (
                            <video
                              width="120px"
                              height="120px"
                              muted
                              autoPlay
                              loop
                            >
                              <source src="item" type="video/quicktime" />
                              <source src="item" type="video/mp4" />
                            </video>
                          )}
                          <div onClick="removeImg(index)">
                            {/* <SvgWrapper
                              svgSrc="close-photo"
                              className={`${styles.svg}`}
                            /> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* <div className={`${styles.divider}`}></div> */}
              {/* <div className={`${styles.textarea}`}>
                <div>
                  {t("resource.common.comments")}{" "}
                  <span>({t("resource.common.optional")})</span>
                </div>
                <textarea
                  placeholder={t("resource.common.enter_reason")}
                  value={extraComment}
                  onChange={(e) =>
                    setExtraComment(e.target.value.slice(0, 1000))
                  }
                ></textarea>
              </div> */}

              <div className={`${styles.updateBtns}`}>
                <button
                  type="button"
                  className={`${styles.commonBtn} ${styles.btn} ${styles.cancelBtn}`}
                  onClick={onDontUpdate}
                >
                  {t("resource.common.dont")} {updateType("cancelBtn")}
                </button>
                <button
                  type="button"
                  className={`${styles.commonBtn} ${styles.btn}`}
                  disabled={buttondisable}
                  onClick={() => onUpdate()}
                >
                  {t("resource.common.continue")}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </ProfileRoot>
  );
}

export default ProfileShipmentUpdatePage;
