import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import Input from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import OrdersHeader from "@gofynd/theme-template/components/order-header/order-header";
import "@gofynd/theme-template/components/order-header/order-header.css";
import ShipmentUpdateItem from "@gofynd/theme-template/components/shipments-update-item/shipments-update-item";
import "@gofynd/theme-template/components/shipments-update-item/shipments-update-item.css";
import BeneficiaryList from "@gofynd/theme-template/components/beneficiary-list/beneficiary-list";
import "@gofynd/theme-template/components/beneficiary-list/beneficiary-list.css";
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
import {
  useNavigate,
  useGlobalTranslation,
  useGlobalStore,
} from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import {
  COMPLETE_MEDIA_UPLOAD,
  START_MEDIA_UPLOAD,
} from "../../queries/shipmentQuery";
import ArrowDropdownIcon from "../../assets/images/arrow-dropdown-black.svg";
import CrossContainedIcon from "../../assets/images/cross-contained-black.svg";
import OtherUpi from "../../assets/images/other-upi.svg";
import RadioIcon from "../../assets/images/radio";
import Bolt from "../../assets/images/bolt.svg";
import NewBankIcon from "../../assets/images/bank-icon.svg";
import VerifiedBadgeIcon from "../../assets/images/verified-badge-icon.svg";
import MessageCard from "../../components/message-card/message-card";
import useRefundManagement from "../refund-management/useRefundManagement";
import {
  ADD_BENEFICIARY_BANK,
  ADD_BENEFICIARY_UPI,
  UPDATE_DEFAULT_BENEFICIARY,
} from "../../queries/refundQuery";
import { validateAccounHolder, validateAccountNo } from "../../helper/utils";
import BankAccountItem from "../../components/bank-account-item/bank-account-item";
import SaveUpiItem from "../../components/save-upi-item/save-upi-item";
import RefundBreakup from "../../components/refund-breakup/refund-breakup";
import ContacRefundSupport from "../../components/contact-refund-support/contact-refund-support";
import RefundSummary from "../../components/refund-summary/refund-summary";
import { getGroupedShipmentBags } from "../../helper/utils";

function ProfileShipmentUpdatePage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { globalConfig } = useThemeConfig({ fpi });
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const DEFAULT_ERROR_TEXT = t("resource.common.error_message");
  const [updatedQty, setUpdatedQty] = useState(1);
  const [extraComment, setExtraComment] = useState("");
  const [commentCount, setCommentCount] = useState(0);
  const [type, setType] = useState("");
  const [previewList, setPreviewList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [accordianlv1, setAccordianlv1] = useState({});
  const [selectedReason, setSelectedReason] = useState({});
  const [showReasonsAccordion, setShowReasonsAccordion] = useState({ 0: true });
  const [selectedBeneficary, setSelectedBeneficary] = useState(null);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [reasonOtherText, setReasonOtherText] = useState("");
  const [addBankErrorMsg, setAddBankErrorMsg] = useState("");
  const [addUpiErrorMsg, setAddUpiErrorMsg] = useState("");

  const [addNewBankAccount, setAddNewBankAccount] = useState("");
  const [refundBreakup, setRefundBreakup] = useState(false);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [isValidIfsc, setIsValidIfsc] = useState(false);
  const [branchName, setBranchName] = useState(null);
  const [bankName, setBankName] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [selectedRefundOptionObj, setSelectedRefundOptionObj] = useState(null);
  const { showSnackbar } = useSnackbar();

  const [filteredUPISuggestions, setFilteredUPISuggestions] = useState([]);
  const [showUPIAutoComplete, setUPIAutoComplete] = useState(false);
  const [isUpiSuffixSelected, setIsUpiSuffixSelected] = useState(false);
  const selectedUpiRef = useRef(null);
  const [vpa, setvpa] = useState("");
  const [otherUPI, setOtherUPI] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [agreeToReturnConditions, setAgreeToReturnConditions] = useState(true);

  const [cancelOrder, setcancelOrder] = useState(false);
  const [hideBtnSection, setHideBtnSection] = useState(false);
  const {
    isLoading,
    shipmentDetails,
    reasonsList,
    getBagReasons,
    updateShipment,
    showPolling,
  } = useShipmentDetails(fpi);

  const {
    refundOptions,
    refundBreakupSummary,
    refundBeneficiaries,
    FetchGetRefundBeneficiaries,
    isRefundConfigEnable,
    upiSuggestionList,
  } = useRefundManagement(fpi);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
    setValue,
    getValues,
    trigger,
    reset,
    clearErrors,
  } = useForm({
    defaultValues: {
      ifscCode: "",
      accountNo: "",
      confirmedAccountNo: "",
      accounHolder: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const selectedOption = watch("refundOption");
  const upiId = watch("upiId");
  const ifscCodeValue = watch("ifscCode");
  const upiInputRef = useRef(null);
  const upiSuggestionsRef = useRef(null);
  const {
    refundDetails,
    getRefundDetails,
    addBeneficiaryDetails,
    verifyIfscCode,
  } = useRefundDetails(fpi);

  const { sections = [] } = page || {};

  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  const queryParams = new URLSearchParams(location.search);
  const selected_bag_id = queryParams.get("selectedBagId") || "";
  const updateType = (cancelBtn) => {
    if (shipmentDetails) {
      if (shipmentDetails?.can_cancel) {
        if (cancelBtn === "cancelBtn") {
          return t("resource.facets.cancel");
        } else {
          return t("resource.facets.cancel_request");
        }
      } else if (shipmentDetails?.can_return) {
        if (cancelBtn === "cancelBtn") {
          return t("resource.facets.cancel_caps");
        } else {
          return t("resource.facets.return");
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
    }
    return () => {};
  }, [shipmentDetails?.order_id]);
  const upiErrorRef = useRef(null);
  const bankErrorRef = useRef(null);

  useEffect(() => {
    setAccordianlv1({
      0: reasonsList?.reasons || [],
    });
    return () => {};
  }, [reasonsList]);

  const { bags, bundleGroups, bundleGroupArticles } = useMemo(() => {
    return getGroupedShipmentBags(shipmentDetails?.bags, {
      isPartialCheck: params?.type === "return",
    });
  }, [shipmentDetails?.bags, params?.type]);

  const includesIgnoreCase = (str = "", keyword = "") =>
    str?.toLowerCase().includes(keyword?.toLowerCase());

  const includesIgnoreCaseArr = (str = "", arr = []) =>
    arr.some((item) => str.toLowerCase().includes(item.toLowerCase()));

  const refundTypes = ["store credits", "settle off", "refund to source"];

  useEffect(() => {
    const bankFields = [
      "accounHolder",
      "accountNo",
      "confirmedAccountNo",
      "ifscCode",
    ];
    if (includesIgnoreCase(selectedOption, "upi")) {
      const hasUpiValue = getValues("upiId");
      if (hasUpiValue || touchedFields.upiId) {
        trigger("upiId");
      } else {
        clearErrors("upiId");
      }
    } else if (includesIgnoreCase(selectedOption, "bank")) {
      const hasBankInput =
        bankFields.some((field) => getValues(field)) ||
        bankFields.some((field) => touchedFields[field]);
      if (hasBankInput) {
        trigger(bankFields);
      } else {
        clearErrors(bankFields);
      }
    }
  }, [selectedOption, trigger, touchedFields, getValues, clearErrors]);

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
        } else if (+key !== 0) {
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
      if (+key < +idx + 1 && +key !== 0) {
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

  const ValidateVPA = (vpa) => {
    const validPattern = /^\w+@\w+$/;
    return validPattern.test(vpa);
  };

  const validateBaseConditions = useMemo(() => {
    if (!selectLast() || selectedReason[selectLast()]?.reasons?.length > 0) {
      return false;
    }

    // If backend says remark is mandatory, ensure it's present.
    const lastReasonIdx = selectLast();
    const selectedReasonObj =
      lastReasonIdx !== undefined ? selectedReason?.[lastReasonIdx] : undefined;
    const selectedReasonMeta = selectedReasonObj?.meta || {};
    if (
      selectedReasonMeta?.show_text_area &&
      selectedReasonMeta?.remark_required === true
    ) {
      const rawOtherText =
        selectedReasonObj?.reason_other_text ?? reasonOtherText ?? "";
      const otherReasonText =
        typeof rawOtherText === "string"
          ? rawOtherText.trim()
          : (rawOtherText?.target?.value || "").toString().trim();
      if (!otherReasonText) {
        return false;
      }
    }

    if (shipmentDetails?.can_return && showimg() && imageList.length === 0) {
      return false;
    }
    return true;
  }, [shipmentDetails, selectedReason, imageList, reasonOtherText]);

  const validateRefundMode = useMemo(() => {
    if (
      shipmentDetails?.delivery_date === null &&
      refundOptions?.length === 0
    ) {
      return true;
    }

    if (
      refundOptions.length > 0 &&
      (shipmentDetails?.can_return || shipmentDetails?.delivery_date === null)
    ) {
      if (!selectedOption) {
        return false;
      }

      if (includesIgnoreCase(selectedOption, "upi")) {
        const isUpiFormFilled =
          getValues("upiId") &&
          !errors.upiId &&
          ValidateVPA(getValues("upiId"));
        if (!!refundBeneficiaries?.upi?.length) {
          if (otherUPI) {
            if (!isUpiFormFilled) {
              return false;
            }
          } else {
            if (!selectedUpi) {
              return false;
            }
          }
        } else {
          if (!isUpiFormFilled) {
            return false;
          }
        }
      }

      if (includesIgnoreCase(selectedOption, "bank")) {
        const isBankFormFilled =
          getValues("accounHolder") &&
          getValues("accountNo") &&
          getValues("confirmedAccountNo") &&
          getValues("ifscCode") &&
          !errors.accounHolder &&
          !errors.accountNo &&
          !errors.confirmedAccountNo &&
          !errors.ifscCode;
        if (!selectedBank && !isBankFormFilled) {
          return false;
        }
      }
    }

    return true;
  }, [
    shipmentDetails?.delivery_date,
    shipmentDetails?.can_return,
    refundOptions,
    selectedOption,
    selectedUpi,
    selectedBank,
    otherUPI,
    refundBeneficiaries?.upi,
    refundDetails,
    getValues("upiId"),
    getValues("accounHolder"),
    getValues("accountNo"),
    getValues("confirmedAccountNo"),
    getValues("ifscCode"),
    errors.upiId,
    errors.accounHolder,
    errors.accountNo,
    errors.confirmedAccountNo,
    errors.ifscCode,
  ]);

  const buttondisable = useMemo(() => {
    if (!validateBaseConditions) {
      return true;
    }

    if (!validateRefundMode) {
      return true;
    }

    if (!agreeToReturnConditions) {
      return true;
    }

    return false;
  }, [
    validateBaseConditions,
    validateRefundMode,
    agreeToReturnConditions,
    refundOptions.length,
  ]);

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
    const line_number = getBag?.[0]?.line_number;
    const identifier = getBag?.[0]?.seller_identifier;
    const productsArr = [{ quantity, line_number, identifier }];
    return productsArr;
  };

  const getUpdateConfigParams = (reason, cdn_urls, newBeneficiaryId) => {
    const getProducts = getProductDetails();
    const refundModes = selectedRefundOptionObj?.refund_modes || [];
    console.log(refundModes, "refundModes");
    const updatedRefundModes = refundModes.map((mode) => {
      if (
        includesIgnoreCase(selectedOption, "bank") &&
        includesIgnoreCase(mode.display_name, "bank")
      ) {
        return {
          ...mode,
          beneficiary_details: {
            beneficiary_id: newBeneficiaryId || selectedBank?.id,
          },
        };
      }

      if (
        includesIgnoreCase(selectedOption, "upi") &&
        includesIgnoreCase(mode.display_name, "upi")
      ) {
        return {
          ...mode,
          beneficiary_details: {
            beneficiary_id: newBeneficiaryId || selectedUpi?.id,
          },
        };
      }
      return mode;
    });

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
                  ...(updatedRefundModes.length > 0 && {
                    refund_modes: updatedRefundModes,
                  }),
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
                  ...(updatedRefundModes.length > 0 && {
                    refund_modes: updatedRefundModes,
                  }),
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
          ? newBeneficiaryId || selectedBeneficary?.id
          : "",
        qc_image_urls: cdn_urls,
        products: getProducts,
      };
    }
  };

  const addUpi = async (formdata) => {
    setLoadSpinner(true);
    try {
      const variables = {
        upi: formdata.upiId,
        order_id: shipmentDetails?.order_id,
        shipment_id: shipmentDetails?.shipment_id,
      };

      const response = await fpi.executeGQL(ADD_BENEFICIARY_UPI, variables);
      const data = response?.data?.addBeneficiary || {};
      if (data?.is_verified) {
        getBeneficiaryDetails();
        setSelectedBeneficary({
          beneficiary_id: data.id,
          upi: data.upi,
        });
        return response;
      } else {
        console.log(response.errors[0].message, "eerrrrrrrr");
        const errMsg =
          data?.message ||
          response?.errors[0]?.message ||
          t("resource.checkout.failed_to_add_upi_id");
        setAddUpiErrorMsg(errMsg);
        setTimeout(() => {
          if (touchedFields?.upiId && upiErrorRef.current) {
            upiErrorRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    } catch (err) {
      const errMsg = err?.message || t("resource.common.address.error_message");
      setAddUpiErrorMsg(errMsg);
    } finally {
      setLoadSpinner(false);
    }
  };
  const resetBankForm = () => {
    reset({
      accounHolder: "",
      accountNo: "",
      confirmedAccountNo: "",
      ifscCode: "",
    });
    clearErrors();
    setIsValidIfsc(false);
    setBranchName("");
    setBankName("");
  };

  const resetUpiForm = () => {
    reset({
      upiId: "",
    });
    clearErrors("upiId");
    setAddUpiErrorMsg("");
  };

  const addBankAccount = async (formdata) => {
    setLoadSpinner(true);
    setAddBankErrorMsg("");
    try {
      const variables = {
        account_holder: formdata.accounHolder,
        account_no: formdata.accountNo,
        ifsc_code: formdata.ifscCode,
        order_id: shipmentDetails?.order_id,
        shipment_id: shipmentDetails?.shipment_id,
      };

      const response = await fpi.executeGQL(ADD_BENEFICIARY_BANK, variables);
      const data = response?.data?.addBeneficiary || {};
      if (data?.is_verified) {
        if (shipmentDetails?.order_id && shipmentDetails?.shipment_id) {
          FetchGetRefundBeneficiaries(
            shipmentDetails.order_id,
            shipmentDetails.shipment_id
          );
        }

        const newBank = {
          beneficiary_id: data.id,
          account_no: formdata.accountNo,
          account_holder: formdata.accounHolder,
          ifsc_code: formdata.ifscCode,
        };
        setSelectedBank(newBank);
        setAddNewBankAccount(false);
        resetBankForm();
        return response;
      } else {
        const errMsg =
          response?.errors?.[0]?.message ||
          t("resource.checkout.failed_to_add_bank_account");
        setAddBankErrorMsg(errMsg);
        setTimeout(() => {
          if (bankErrorRef.current) {
            bankErrorRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    } catch (err) {
      const errMsg =
        err?.response?.errors?.[0]?.message ||
        t("resource.common.address.error_message");
      setAddBankErrorMsg(errMsg);
    } finally {
      setLoadSpinner(false);
    }
  };

  const validateIfscCode = async (value) => {
    if (value.length !== 11) {
      setIsValidIfsc(false);
      setBranchName("");
      setBankName("");
      return "Please enter valid IFSC code";
    }
    try {
      const data = await verifyIfscCode(value);
      const ifscDetails = data?.verify_IFSC_code;

      if (ifscDetails && Object.keys(ifscDetails).length) {
        setBranchName(ifscDetails.branch_name);
        setBankName(ifscDetails.bank_name);
        setIsValidIfsc(true);
        return true;
      } else {
        setIsValidIfsc(false);
        setBranchName("");
        setBankName("");
        return data?.message || t("resource.common.invalid_ifsc_code");
      }
    } catch (error) {
      setIsValidIfsc(false);
      setBranchName("");
      setBankName("");
      return t("resource.common.error_validating_ifsc");
    }
  };

  const setUpdatedOrders = (obj) => {
    console.log(obj, "obj");
    setInProgress(true);
    if (shipmentDetails?.can_cancel) {
      updateShipment(obj, "cancel");
    }
    if (shipmentDetails?.can_return) {
      updateShipment(obj, "return", refundOptions, shipmentDetails?.order_id);
    }
    setInProgress(false);
  };

  const redirectToOrders = () => {
    navigate(
      `/return/order/${shipmentDetails?.order_id}/shipment/${shipmentDetails?.shipment_id}`
    );
  };

  const showUpdateErrorText = (text) => {
    setConfirmReturn(false);
    setInProgress(false);
    window.scrollTo(0, 0);
    if (text) {
      showSnackbar(text.toString(), "error");
    } else {
      showSnackbar(DEFAULT_ERROR_TEXT, "error");
    }
  };

  const onUpdate = async () => {
    const isBankFormFilled =
      getValues("accounHolder") &&
      getValues("accountNo") &&
      getValues("confirmedAccountNo") &&
      getValues("ifscCode") &&
      !errors.accounHolder &&
      !errors.accountNo &&
      !errors.confirmedAccountNo &&
      !errors.ifscCode;

    const isUpiFormFilled =
      getValues("upiId") && !errors.upiId && ValidateVPA(getValues("upiId"));

    let newBeneficiaryId = null;
    if (
      (includesIgnoreCase(selectedOption, "bank") &&
        (!refundBeneficiaries ||
          refundBeneficiaries?.bank === null ||
          refundBeneficiaries?.bank?.length === 0) &&
        isBankFormFilled) ||
      addNewBankAccount
    ) {
      try {
        const formData = {
          accounHolder: getValues("accounHolder"),
          accountNo: getValues("accountNo"),
          confirmedAccountNo: getValues("confirmedAccountNo"),
          ifscCode: getValues("ifscCode"),
        };

        const response = await addBankAccount(formData);
        console.log(response, "response");
        if (!response?.data?.addBeneficiary?.id) {
          showUpdateErrorText(
            t("resource.checkout.failed_to_add_bank_account")
          );
          return;
        }
        newBeneficiaryId = response.data.addBeneficiary.id;

        // Reset form and state after successful bank account addition
        setValue("accountHolderName", "");
        setValue("accountNumber", "");
        setValue("confirmAccountNumber", "");
        setValue("ifscCode", "");
        setIsValidIfsc(false);
        setBranchName("");
        setBankName("");
      } catch (error) {
        showUpdateErrorText(t("resource.checkout.failed_to_add_bank_account"));
        return;
      }
    }

    // Handle UPI addition only if UPI is selected and form is filled
    if (includesIgnoreCase(selectedOption, "upi") && isUpiFormFilled) {
      try {
        const formData = {
          upiId: getValues("upiId"),
        };
        const response = await addUpi(formData);
        const backendErrorMsg = response?.errors?.[0]?.message;
        if (!response?.data?.addBeneficiary?.id) {
          const errMsg =
            backendErrorMsg || t("resource.checkout.failed_to_add_upi_id");

          setAddUpiErrorMsg(errMsg);
          return;
        }
        newBeneficiaryId = response.data.addBeneficiary.id;

        // Reset UPI form and state after successful UPI addition
        setValue("upiId", "");
        setValue("save_upi_id", false);
        setvpa("");
        setFilteredUPISuggestions([]);
        setUPIAutoComplete(false);
        setIsUpiSuffixSelected(false);
        selectedUpiRef.current = null;
      } catch (error) {
        const errMsg =
          error?.response?.errors?.[0]?.message ||
          error?.message ||
          t("resource.checkout.failed_to_add_bank_account");
        setAddUpiErrorMsg(errMsg);
        return;
      }
    }

    // Proceed with further validations only if bank/UPI additions were successful or not required
    // Validate reason selection
    const reason = selectedReason;
    const lastReasonIdx = selectLast();
    const selectedReasonObj =
      lastReasonIdx !== undefined ? reason?.[lastReasonIdx] : undefined;

    if (!selectedReasonObj?.id) {
      return showUpdateErrorText(
        t("resource.refund_order.please_select_a_reason_for_return")
      );
    }

    // Validate reason remark only if backend marks it mandatory
    const selectedReasonMeta = selectedReasonObj?.meta || {};
    const rawOtherText =
      selectedReasonObj?.reason_other_text ?? reasonOtherText ?? "";
    const otherReasonText =
      typeof rawOtherText === "string"
        ? rawOtherText.trim()
        : (rawOtherText?.target?.value || "").toString().trim();

    if (
      selectedReasonMeta?.show_text_area &&
      // Make remark mandatory ONLY when backend explicitly asks for it.
      selectedReasonMeta?.remark_required === true &&
      otherReasonText.length === 0
    ) {
      return showUpdateErrorText(
        shipmentDetails?.can_cancel
          ? t("resource.refund_order.write_reason_for_cancellation")
          : t("resource.refund_order.please_write_a_reason_for_return")
      );
    }

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
      if (!filesizecheck) {
        return showUpdateErrorText(t("resource.profile.image_size_max_5mb"));
      }

      if (videos?.length) {
        const filesizecheckvideo = videos.every(
          (item) => item.size / 1000 < 25000
        );
        if (!filesizecheckvideo) {
          return showUpdateErrorText(t("resource.profile.video_size_max_25mb"));
        }
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

    if (getStatusForUpdate() === "return_pre_qc") {
      setInProgress(true);

      // Upload media files
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
            namespace: "misc",
          });
        })
      );

      setInProgress(false);
      cdnUrls = completeUploadResponse.map((item) => {
        return { desc: "", url: item.data?.completeUpload?.cdn?.url };
      });
    }

    if (
      refundOptions.length > 0 &&
      shipmentDetails?.can_return &&
      refundDetails?.user_beneficiaries_detail?.show_beneficiary_details
    ) {
      if (!selectedOption) {
        return showUpdateErrorText(
          t("resource.refund_option.please_select_a_refund_option")
        );
      }

      if (
        includesIgnoreCase(selectedOption, "upi") &&
        !selectedUpi &&
        !isUpiFormFilled &&
        !newBeneficiaryId
      ) {
        return showUpdateErrorText(
          t("resource.order.please_select_or_add_a_valid_upi_id")
        );
      }

      if (
        includesIgnoreCase(selectedOption, "bank") &&
        !selectedBank &&
        !isBankFormFilled &&
        !newBeneficiaryId
      ) {
        return showUpdateErrorText(
          t("resource.order.please_select_or_add_a_valid_bank_account")
        );
      }
    }

    let beneficiaryToSetAsDefault = null;

    if (includesIgnoreCase(selectedOption, "upi") && selectedUpi?.id) {
      beneficiaryToSetAsDefault = selectedUpi.id;
    }

    if (includesIgnoreCase(selectedOption, "bank") && selectedBank?.id) {
      beneficiaryToSetAsDefault = selectedBank.id;
    }

    if (newBeneficiaryId) {
      beneficiaryToSetAsDefault = newBeneficiaryId;
    }

    if (beneficiaryToSetAsDefault) {
      try {
        const response = await fpi.executeGQL(UPDATE_DEFAULT_BENEFICIARY, {
          setDefaultBeneficiaryRequestInput: {
            beneficiary_id: beneficiaryToSetAsDefault,
            order_id: shipmentDetails?.order_id,
            shipment_id: shipmentDetails?.shipment_id,
          },
        });

        const responseData = response?.data?.updateDefaultBeneficiary;

        if (!responseData) {
          const backendError =
            response?.errors?.[0]?.message ||
            t("resource.refund_order.failed_to_set_default_beneficiary");
          showSnackbar(backendError, "error");
          setInProgress(false);
          return;
        }

        if (responseData.success && responseData.is_beneficiary_set) {
          const successMessage =
            responseData?.message ||
            t("resource.refund_order.updated_default_beneficiary_successfully");
          console.log(successMessage);
        } else {
          const failureMessage =
            responseData?.message ||
            t("resource.refund_order.Failed_to_set_update_default_beneficairy");
          showSnackbar(failureMessage, "error");
          setInProgress(false);
        }
      } catch (error) {
        const errorMessage =
          error?.errors?.[0]?.message ||
          error?.message ||
          t("resource.common.error_message");
        showSnackbar(errorMessage, "error");
        setInProgress(false);
      }
    }

    const config = getUpdateConfigParams(reason, cdnUrls, newBeneficiaryId);
    setUpdatedOrders(config);
  };

  const handleCancelModelOpen = () => {
    setHideBtnSection(true);
    setcancelOrder(true);
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
      showSnackbar(t("resource.common.file_already_exists"), "error");
    }

    event.target.value = null;
  };

  const handleRemoveFile = (id) => {
    // Revoke URL for the removed file to free memory
    const removedFile = imageList.find((file) => file.id === id);
    if (removedFile) URL.revokeObjectURL(removedFile.preview);

    setImageList((prevList) => prevList.filter((file) => file.id !== id));
  };

  useEffect(() => {
    if (upiId && !isUpiSuffixSelected) {
      const syntheticEvent = {
        target: {
          value: upiId || "",
        },
      };
      handleUPIChange(syntheticEvent);
    }
  }, [upiId, isUpiSuffixSelected]);

  const handleUpiSubmit = (formdata) => {
    addUpi(formdata);
  };

  const handleFormSubmit = (formdata) => {
    addBankAccount(formdata);
    if (isMobile) {
      onCloseModal();
    }
  };

  const formFields = [
    {
      label: t("resource.order.account_holder_name"),
      name: "accounHolder",
      type: "text",
      required: t("resource.refund_order.account_holder_required"),
      validate: (value) => {
        const result = validateAccounHolder(value);
        return result === true ? true : t(result);
      },
    },
    {
      label: t("resource.order.account_number"),
      name: "accountNo",
      type: "text",
      required: t("resource.refund_order.account_number_is_required"),
      maxLength: 18,
      validate: (value) => {
        const result = validateAccountNo(value);
        return result === true ? true : t(result);
      },
      inputClassName: styles.paymentInputSecurity,
      onInput: (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 18);
      },
    },
    {
      label: t("resource.order.confirm_account_number"),
      name: "confirmedAccountNo",
      type: "text",
      required: t("resource.refund_order.confirm_account_number_is_required"),
      maxLength: 18,
      validate: (value) => {
        if (!value) {
          return t("resource.refund_order.confirm_account_number_is_required");
        }

        const cleanValue = value.replace(/\s/g, "");

        if (cleanValue.length > 18) {
          return t("resource.refund_order.account_number_max_18_digits");
        }

        const accountNo = getValues("accountNo");
        if (cleanValue !== accountNo) {
          return t("resource.refund_order.account_numbers_do_not_match");
        }

        return true;
      },
      onInput: (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 18);
      },
      onPaste: (e) => e.preventDefault(),
      onDrop: (e) => e.preventDefault(),
      onKeyDown: (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
          e.preventDefault();
        }
      },
    },
    {
      label: t("resource.common.ifsc_code"),
      name: "ifscCode",
      type: "text",
      required: t("resource.refund_order.ifsc_code_required"),
      maxLength: 11,
      validate: async (value) => validateIfscCode(value),
    },
  ];

  const handleBankChange = (bank) => {
    setSelectedBank(bank);
    setAddNewBankAccount(false);
    setAddBankErrorMsg("");

    reset(
      {
        accounHolder: "",
        accountNo: "",
        confirmedAccountNo: "",
        ifscCode: "",
        refundOption: getValues("refundOption"),
      },
      { keepErrors: false, keepDirty: false }
    );

    clearErrors();
    setIsValidIfsc(false);
    setBranchName("");
    setBankName("");
  };

  const handleUpiChange = (upi) => {
    setSelectedUpi(upi);
    setOtherUPI(false);
    reset(
      {
        upiId: "",
        refundOption: getValues("refundOption"),
      },
      { keepErrors: false, keepDirty: false }
    );

    clearErrors("upiId");
    setAddUpiErrorMsg("");
    setIsUpiSuffixSelected(false);
    setFilteredUPISuggestions([]);
    setUPIAutoComplete(false);
    setvpa("");
    selectedUpiRef.current = null;
  };

  const onCloseModal = () => {
    reset();
    setIsValidIfsc(false);
    setBranchName("");
    setBankName("");
    setAddNewBankAccount(false);

    if (shipmentDetails?.order_id && shipmentDetails?.shipment_id) {
      FetchGetRefundBeneficiaries(
        shipmentDetails.order_id,
        shipmentDetails.shipment_id
      );
    }
  };

  const onCloseRefundBreakupModal = () => {
    setRefundBreakup(false);
  };
  const onCloseCancelOrderModal = () => {
    setHideBtnSection(false);
    setcancelOrder(false);
  };

  useEffect(() => {
    if (!showUPIAutoComplete) return;

    const handleClickOutside = (event) => {
      if (
        upiSuggestionsRef.current &&
        !upiSuggestionsRef.current.contains(event.target)
      ) {
        setUPIAutoComplete(false);
        setFilteredUPISuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [showUPIAutoComplete]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "accountNo" && touchedFields.confirmedAccountNo) {
        trigger("confirmedAccountNo");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, touchedFields]);

  const renderBankAccountForm = () => (
    <>
      <div
        className={`${styles.bankAccountForm} ${addNewBankAccount ? styles.renderNewBankAccount : ""}`}
      >
        {addBankErrorMsg && (
          <div ref={bankErrorRef} className={styles.bankErrorContainer}>
            <MessageCard message={addBankErrorMsg} isError={true} />
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className={styles.addAccountForm}>
            {formFields.map((field) => (
              <div className={styles.bankFormInput} key={field.name}>
                <Input
                  label={field.label}
                  labelVariant="floating"
                  showAsterik={field.required}
                  required={field.required}
                  id={field.name}
                  type={field.type}
                  maxLength={field.maxLength}
                  inputClassName={field.inputClassName}
                  {...register(field.name, {
                    required: field.required,
                    validate: field.validate,
                    onChange: (e) => {
                      // Trigger validation immediately on change
                      if (
                        field.name === "accountNo" &&
                        touchedFields.confirmedAccountNo
                      ) {
                        // Also validate confirm account if it's been touched
                        trigger(["accountNo", "confirmedAccountNo"]);
                      } else {
                        trigger(field.name);
                      }
                    },
                    onBlur: () => {
                      // Validate on blur as well
                      trigger(field.name);
                    },
                  })}
                  onInput={
                    field.name === "accounHolder"
                      ? (e) => {
                          // Allow only letters, spaces, and allowed special characters
                          e.target.value = e.target.value.replace(
                            /[^a-zA-Z\s.',-]/g,
                            ""
                          );
                          // Trigger validation after input cleanup
                          trigger(field.name);
                        }
                      : field.onInput
                  }
                  onPaste={field.onPaste}
                  onDrop={field.onDrop}
                  onKeyDown={field.onKeyDown}
                  error={!!errors?.[field.name]}
                  errorMessage={errors?.[field.name]?.message || ""}
                />
                {isValidIfsc && field.name === "ifscCode" && ifscCodeValue && (
                  <span className={styles.ifscIcon}>
                    <VerifiedBadgeIcon />
                  </span>
                )}
              </div>
            ))}
          </div>
        </form>
      </div>
    </>
  );

  const renderUpiForm = () => (
    <>
      {addUpiErrorMsg && (
        <div
          ref={upiErrorRef}
          className={`${styles.bankErrorContainer} ${refundBeneficiaries?.upi && refundBeneficiaries?.upi?.length > 0 ? styles.addUpiErrorContainer : ""}`}
        >
          <MessageCard message={addUpiErrorMsg} isError={true} />
        </div>
      )}
      <form
        onSubmit={handleSubmit(handleUpiSubmit)}
        className={`${styles.addAccountForm} ${styles.getUpiInput} ${!refundBeneficiaries?.upi?.length ? styles.addMarginToUpiForm : ""}`}
      >
        <Input
          label={t("resource.common.enter_upi_id")}
          labelVariant="floating"
          ref={upiInputRef}
          showAsterik
          required
          id="1"
          maxLength={18}
          autoComplete="off"
          type="text"
          {...register("upiId", {
            required: t("resource.common.upi_id_is_required"),

            validate: (value) =>
              !value?.trim()
                ? t("resource.common.upi_id_is_required")
                : ValidateVPA(value.trim())
                  ? true
                  : t("resource.checkout.invalid_upi_id"),
          })}
          onChange={(e) => {
            const { onChange } = register("upiId");
            onChange(e);
            handleUPIChange(e);
          }}
          onFocus={(e) => handleUPIChange(e)}
          error={!!errors?.upiId && touchedFields.upiId}
          errorMessage={errors?.upiId?.message || ""}
        />

        {!isMobile &&
          showUPIAutoComplete &&
          filteredUPISuggestions.length > 0 && (
            <div
              className={styles.upiSuggestionsDesktop}
              ref={upiSuggestionsRef}
            >
              <ul className={styles.upiAutoCompleteWrapper}>
                {filteredUPISuggestions.map((suffix) => (
                  <li
                    key={suffix}
                    className={styles.upiAutoCompleteItem}
                    onClick={() =>
                      onClickAutoComplete(`${vpa.replace(/@.*/, "")}${suffix}`)
                    }
                  >
                    {`${vpa.replace(/@.*/, "")}${suffix}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {isMobile &&
          showUPIAutoComplete &&
          filteredUPISuggestions.length > 0 && (
            <div ref={upiSuggestionsRef}>
              <ul className={styles.upiChipsWrapper}>
                {filteredUPISuggestions.map((suffix) => (
                  <li
                    key={suffix}
                    className={styles.upiChip}
                    onClick={() =>
                      onClickAutoComplete(`${vpa.replace(/@.*/, "")}${suffix}`)
                    }
                  >
                    {suffix}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </form>
    </>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let upiSuggestions = upiSuggestionList || ["okhdfcbank", "okicici", "oksbi"];

  const handleUPIChange = (event) => {
    setIsUpiSuffixSelected(false);
    let value = event.target.value.trim();
    const atCount = (value.match(/@/g) || []).length;
    if (atCount > 1) {
      value = value.slice(0, -1);
    }

    setvpa(value);
    selectedUpiRef.current = null;

    if (value.includes("@")) {
      setIsUpiSuffixSelected(true);
      const [prefix, suffix = ""] = value.split("@");
      const filtered =
        suffix.trim() === ""
          ? upiSuggestions
          : upiSuggestions.filter((suggestion) =>
              suggestion.toLowerCase().includes(suffix.toLowerCase())
            );
      setFilteredUPISuggestions(filtered);
      setUPIAutoComplete(true);
    } else {
      setFilteredUPISuggestions([]);
      setUPIAutoComplete(false);
    }
  };

  const onClickAutoComplete = (selectedValue) => {
    setvpa(selectedValue);
    setValue("upiId", selectedValue, { shouldValidate: true });
    setFilteredUPISuggestions([]);
    setUPIAutoComplete(false);
    selectedUpiRef.current = null;
  };

  const handleOtherUpiChange = () => {
    setOtherUPI(true);
    setSelectedUpi(null);
  };

  const isPaymentTypeCOD = shipmentDetails?.payment_info?.some(
    (item) => item.payment_mode === "COD" || item.payment_mode === "NON_PREPAID"
  );

  const handleCommentChange = (event) => {
    const comment = event.target.value.slice(0, 100);
    setExtraComment(comment);
    setCommentCount(comment.length);
  };

  const refundAmountItem = refundBreakupSummary?.refund_price_breakup?.find(
    (item) => item.name === "refund_amount"
  );

  const refundAmount = refundAmountItem?.value || 0;

  const paymentMode = shipmentDetails?.payment_info?.[0]?.payment_mode;

  const isCOD = paymentMode === "COD" || paymentMode === "NON_PREPAID";
  const isPrepaid = !isCOD;

  // This should be is_refund_config_enabled from backend
  const isPlatformConfigOn = isRefundConfigEnable === true;
  const isPlatformConfigOff = !isPlatformConfigOn;

  // Treat refundOptions as "refund_modes"
  const hasRefundModes = refundOptions?.length > 0;

  // 1) When to show "As per mode selection" UI (options list)
  //    -> Platform config ON + refund_modes present
  const showRefundOptions = isPlatformConfigOn && hasRefundModes;

  // 2) When to show "Default: Refund To Source mode's msg"
  //    -> Platform config ON + NO refund modes + Prepaid
  const showRefundToSourceMsg =
    isPlatformConfigOn && !hasRefundModes && isPrepaid;

  // 3) When to show pure "Contact Customer Care"
  //    - Platform config OFF (any PP/COD, any modes)
  //    - OR Platform config ON + NO refund modes + COD
  const showContactSupport =
    isPlatformConfigOff || (isPlatformConfigOn && !hasRefundModes && isCOD);

  return (
    <ProfileRoot
      fpi={fpi}
      leftSections={[]}
      rightSections={rightSections}
      globalConfig={globalConfig}
    >
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
          {(!shipmentDetails || Object.keys(shipmentDetails).length === 0) && (
            <div className={`${styles.error} ${styles.shipment}`}>
              <EmptyState
                title="Order not Found"
                description="Please check order status from orders page"
                btnLink="/profile/orders"
                btnTitle="Show Orders"
              />
            </div>
          )}
          {shipmentDetails && Object.keys(shipmentDetails).length > 0 && (
            <div className={` ${styles.shipment}`}>
              <div className={styles.orderHeaderContainer}>
                {shipmentDetails && (
                  <OrdersHeader
                    flag={true}
                    title={`${updateType()}`}
                    customClassName={styles.headerWidth}
                  ></OrdersHeader>
                )}
                {getBag?.map((item, index) => (
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
                ))}
              </div>

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
                  <div className={`${styles.divider}`}></div>
                )}
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
                  </div>
                )}
              {showimg() && <div className={`${styles.divider}`}></div>}
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

              {isPaymentTypeCOD && !shipmentDetails?.can_return ? (
                " "
              ) : (
                <>
                  {showContactSupport ? (
                    <ContacRefundSupport
                      paymentMode={paymentMode}
                      refundAmount={refundAmount}
                      customClassName={styles.contactSupportBox}
                    />
                  ) : showRefundOptions ? (
                    <div className={styles.refundOptionContainer}>
                      <h5 className={styles.refundTitleText}>
                        {t("resource.refund_order.select_refund_option_title")}
                      </h5>
                      <div className={styles.optionWrapper}>
                        {refundOptions?.map((option) => (
                          <React.Fragment key={option.display_name}>
                            <div
                              className={styles.optionContainer}
                              id={`refund-option-${option.display_name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <label className={styles.optionLabel}>
                                <div className={styles.radioWrapper}>
                                  <div
                                    className={styles.refundOptionRadio}
                                    onClick={() => {
                                      if (
                                        includesIgnoreCase(
                                          selectedOption,
                                          "bank"
                                        )
                                      ) {
                                        resetBankForm();
                                        setSelectedBank(null);
                                        setAddNewBankAccount(false);
                                        setAddBankErrorMsg("");
                                      }

                                      if (
                                        includesIgnoreCase(
                                          selectedOption,
                                          "upi"
                                        )
                                      ) {
                                        resetUpiForm();
                                        setSelectedUpi(null);
                                        setOtherUPI(false);
                                        setAddUpiErrorMsg("");
                                      }
                                      setValue(
                                        "refundOption",
                                        option.display_name,
                                        {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        }
                                      );
                                      const selectedOptionObj =
                                        refundOptions.find(
                                          (opt) =>
                                            opt.display_name ===
                                            option.display_name
                                        );
                                      setSelectedRefundOptionObj(
                                        selectedOptionObj || null
                                      );
                                      setOtherUPI(false);

                                      setTimeout(() => {
                                        const optionId = `refund-option-${option.display_name.toLowerCase().replace(/\s+/g, "-")}`;
                                        document
                                          .getElementById(optionId)
                                          ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center",
                                          });
                                      }, 100);
                                    }}
                                  >
                                    <span
                                      className={`${styles.regularRadio} ${selectedOption === option.display_name ? styles.checked : ""}`}
                                    >
                                      <RadioIcon
                                        width={24}
                                        checked={
                                          selectedOption === option.display_name
                                        }
                                      />
                                    </span>
                                    <span className={styles.refundOptionText}>
                                      {option.display_name}
                                    </span>
                                  </div>

                                  {option?.display_name?.toLowerCase() ===
                                  "store credits" ? (
                                    <Bolt className={styles.icon} />
                                  ) : null}
                                </div>
                                {selectedOption === option.display_name && (
                                  <p className={styles.msg}>{option.message}</p>
                                )}
                              </label>

                              {selectedOption === option.display_name &&
                                includesIgnoreCase(
                                  option.display_name,
                                  "bank"
                                ) && (
                                  <div className={styles.bankSectionContainer}>
                                    {!refundBeneficiaries?.bank?.length ? (
                                      <>
                                        <h5
                                          className={
                                            styles.enterBankDetailsTitle
                                          }
                                        >
                                          {t(
                                            "resource.refund_order.enter_bank_details"
                                          )}
                                        </h5>
                                        {renderBankAccountForm()}
                                        <div
                                          className={styles.msgCheckContainer}
                                        >
                                          <div
                                            className={styles.msgCardContainer}
                                          >
                                            <MessageCard
                                              message={t(
                                                "resource.refund_order.estimated_refund_within_7_days_msg"
                                              )}
                                            />
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <h4
                                          className={
                                            styles.recentlyUseBankTitle
                                          }
                                        >
                                          {t(
                                            "resource.checkout.recently_used_bank_account"
                                          )}
                                        </h4>

                                        <div className={styles.saveBank}>
                                          {refundBeneficiaries?.bank?.map(
                                            (bank, index) => {
                                              return (
                                                <BankAccountItem
                                                  key={index}
                                                  bank={bank}
                                                  maskedAccount={
                                                    bank?.account_no
                                                  }
                                                  selectedBank={selectedBank}
                                                  onChange={handleBankChange}
                                                />
                                              );
                                            }
                                          )}

                                          <div
                                            className={`${styles.addNewBankWrapper} ${
                                              addNewBankAccount
                                                ? styles.selected
                                                : ""
                                            }`}
                                            onClick={() => {
                                              setAddNewBankAccount(true);
                                              setSelectedBank(() => null);
                                            }}
                                          >
                                            <div className={styles.header}>
                                              <div className={styles.iconLabel}>
                                                <div
                                                  className={styles.iconWrapper}
                                                >
                                                  <NewBankIcon />
                                                </div>
                                                <span>
                                                  {t(
                                                    "resource.refund_order.add_bank_account_caps"
                                                  )}
                                                </span>
                                              </div>

                                              <div
                                                className={styles.radioWrapper}
                                              >
                                                <RadioIcon
                                                  checked={addNewBankAccount}
                                                />
                                              </div>
                                            </div>

                                            {addNewBankAccount && (
                                              <div
                                                className={styles.formWrapper}
                                              >
                                                {/* <h5>
                                                  {t(
                                                    "resource.refund_order.enter_bank_details"
                                                  )}
                                                </h5> */}
                                                {renderBankAccountForm()}
                                              </div>
                                            )}
                                          </div>
                                          <MessageCard
                                            message={t(
                                              "resource.refund_order.estimated_refund_within_7_days_msg"
                                            )}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                              {selectedOption === option?.display_name &&
                                includesIgnoreCase(
                                  option?.display_name,
                                  "upi"
                                ) && (
                                  <div className={`${styles.upiWrapper}`}>
                                    {!refundBeneficiaries?.upi?.length ? (
                                      <>{renderUpiForm()}</>
                                    ) : (
                                      <>
                                        <h5>
                                          {t(
                                            "resource.refund_order.recently_used_upi"
                                          )}
                                        </h5>
                                        <div className={styles.useUPIWrapper}>
                                          {refundBeneficiaries?.upi?.map(
                                            (upi, index) => (
                                              <div
                                                key={index}
                                                className={styles.upiContainer}
                                              >
                                                <SaveUpiItem
                                                  upi={upi}
                                                  onChange={handleUpiChange}
                                                  selectedUpi={selectedUpi}
                                                />
                                              </div>
                                            )
                                          )}
                                          <div
                                            className={`${styles.upiContainer} ${styles.otherUpiContainer} ${
                                              otherUPI ? styles.selected : ""
                                            }`}
                                            onClick={handleOtherUpiChange}
                                          >
                                            <div className={styles.upi}>
                                              <div
                                                className={styles.OtherUpiName}
                                              >
                                                <div className={styles.upiImg}>
                                                  <OtherUpi />
                                                </div>
                                                <p>
                                                  {t(
                                                    "resource.refund_order.other_upi_id"
                                                  )}
                                                </p>
                                              </div>

                                              <div
                                                className={`${styles.customRadio} ${otherUPI ? styles.checked : ""}`}
                                              >
                                                <RadioIcon
                                                  width={24}
                                                  checked={otherUPI}
                                                />
                                              </div>
                                            </div>
                                            {otherUPI && <>{renderUpiForm()}</>}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    <div
                                      className={
                                        !refundBeneficiaries?.upi?.length
                                          ? styles.upiMsgCard
                                          : ""
                                      }
                                    >
                                      <MessageCard
                                        message={t(
                                          "resource.refund_order.estimated_refund_within_7_days_msg"
                                        )}
                                      />
                                    </div>
                                  </div>
                                )}
                              {selectedOption === option.display_name &&
                                includesIgnoreCaseArr(
                                  option.display_name,
                                  refundTypes
                                ) && (
                                  <div className={styles.msgContainer}>
                                    <MessageCard
                                      message={
                                        option.display_name
                                          .toLowerCase()
                                          .includes("store credit")
                                          ? t(
                                              "resource.refund_order.refund_will_be_processed_instantly_store_creadit_msg"
                                            )
                                          : t(
                                              "resource.refund_order.estimated_refund_within_7_days_msg"
                                            )
                                      }
                                    />
                                  </div>
                                )}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ContacRefundSupport
                      paymentMode={paymentMode}
                      refundAmount={refundAmount}
                      showRefundToSourceMsg={showRefundToSourceMsg}
                      customClassName={styles.contactSupportBox}
                    />
                  )}
                </>
              )}

              {isMobile ? null : isPaymentTypeCOD &&
                shipmentDetails?.can_cancel === true ? (
                ""
              ) : (
                <div className={styles.refundSummaryContainer}>
                  <RefundSummary
                    refundBreakup={refundBreakupSummary?.refund_price_breakup}
                    title={`${t("resource.refund_order.refund_breakup")}`}
                    customClass={styles.deductionAmountFont}
                    customTitleClass={styles.refundTitle}
                    customSubTitleClass={styles.refundSubTitle}
                    amountFontClass={styles.amountFontClass}
                  />
                </div>
              )}

              {isMobile && (
                <Modal
                  isOpen={refundBreakup}
                  title={`${t("resource.refund_order.refund_breakup")}`}
                  closeDialog={onCloseRefundBreakupModal}
                  headerClassName={`${styles.refundSidebarHeader} ${styles.sidebarHeader}`}
                >
                  <RefundBreakup
                    shipmentDetails={refundBreakupSummary?.refund_price_breakup}
                    onCloseRefundBreakupModal={onCloseRefundBreakupModal}
                  />
                </Modal>
              )}

              {!refundBreakup && (
                <div
                  className={`${styles.buttonSectionWrapper} ${styles.outsideBtnSectionCheckbox}`}
                >
                  <div className={styles.checkboxContainer}>
                    <div className={styles.checboxInputContainer}>
                      <input
                        id="agree_to_return_conditions"
                        className={styles.termAndConditioncheckbox}
                        type="checkbox"
                        checked={agreeToReturnConditions}
                        onChange={(e) =>
                          setAgreeToReturnConditions(e.target.checked)
                        }
                      />
                    </div>
                    <label
                      className={styles.label}
                      htmlFor="agree_to_return_conditions"
                    >
                      {shipmentDetails?.delivery_date !== null ? (
                        <>
                          {t(
                            "resource.refund_order.I_agree_to_return_all_item_in_original_condition_msg"
                          )}
                          {/* {isMobile && (
                            <span className={styles.viewPolicyText}>
                              {t("resource.refund_order.view_policy")}
                            </span>
                          )} */}
                        </>
                      ) : (
                        <>
                          By clicking on 'submit', I agree to{" "}
                          <FDKLink
                            to="/terms-and-conditions"
                            target="_blank"
                            className={styles.termsLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Terms & Conditions
                          </FDKLink>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <Modal
                isOpen={cancelOrder}
                title={`${t("resource.refund_order.cancel_order_msg")}`}
                closeDialog={onCloseCancelOrderModal}
                headerClassName={`${styles.cancelOrderSidebarHeader} `}
              >
                <div className={styles.modelBtnContainer}>
                  <button
                    className={styles.cancelOrderNo}
                    onClick={() => {
                      setHideBtnSection(false);
                      setcancelOrder(false);
                    }}
                  >
                    {t("resource.common.no_caps")}
                  </button>
                  <button className={styles.cancelOrderYes} onClick={onUpdate}>
                    {t("resource.common.yes_caps")}
                  </button>
                </div>
              </Modal>

              {!refundBreakup && !hideBtnSection && (
                <div className={styles.updateBtns} style={{ zIndex: "0" }}>
                  <div
                    className={`${styles.buttonSectionWrapper} ${styles.insideBtnSectionCheckbox}`}
                  >
                    <div className={styles.checkboxContainer}>
                      <div className={styles.checboxInputContainer}>
                        <input
                          id="agree_to_return_conditions"
                          className={styles.termAndConditioncheckbox}
                          type="checkbox"
                          checked={agreeToReturnConditions}
                          onChange={(e) =>
                            setAgreeToReturnConditions(e.target.checked)
                          }
                        />
                      </div>
                      <label
                        className={styles.label}
                        htmlFor="agree_to_return_conditions"
                      >
                        {shipmentDetails?.delivery_date !== null ? (
                          <>
                            {t(
                              "resource.refund_order.I_agree_to_return_all_item_in_original_condition_msg"
                            )}
                            {/* {isMobile && (
                            <span className={styles.viewPolicyText}>
                              {t("resource.refund_order.view_policy")}
                            </span>
                          )} */}
                          </>
                        ) : (
                          <>
                            By clicking on 'submit', I agree to{" "}
                            <FDKLink
                              to="/terms-and-conditions"
                              target="_blank"
                              className={styles.termsLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Terms & Conditions
                            </FDKLink>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className={styles.btnContainerWrapper}>
                    {!isMobile && (
                      <button
                        type="button"
                        className={`${styles.commonBtn} ${styles.btn} ${styles.cancelBtn}`}
                        onClick={onDontUpdate}
                      >
                        {updateType("cancelBtn")}
                      </button>
                    )}

                    {isMobile && shipmentDetails?.delivery_date !== null && (
                      <div className={styles.priceBreakupSection}>
                        <span className={styles.refundAmount}>
                          ₹{refundAmount}
                        </span>
                        <span
                          onClick={() => setRefundBreakup(true)}
                          className={styles.viewBreakupBtn}
                        >
                          {t("resource.refund_order.view_breakup")}
                        </span>
                      </div>
                    )}

                    {shipmentDetails?.delivery_date === null && isMobile && (
                      <button
                        className={`${styles.commonBtn} ${styles.btn} ${styles.cancelBtn}`}
                        onClick={onDontUpdate}
                      >
                        {t("resource.facets.cancel_caps")}
                      </button>
                    )}

                    <button
                      type="button"
                      className={`${styles.commonBtn} ${styles.btn} ${styles.continueBtn}`}
                      disabled={buttondisable}
                      onClick={() =>
                        shipmentDetails?.delivery_date !== null
                          ? onUpdate()
                          : handleCancelModelOpen()
                      }
                    >
                      {shipmentDetails?.delivery_date !== null
                        ? t("resource.common.continue")
                        : t("resource.facets.submit")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </ProfileRoot>
  );
}

export default ProfileShipmentUpdatePage;
