import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "../../helper/hooks";
import { useLocation } from "react-router-dom";
import {
  GET_REFUND_BENEFICIARIES,
  GET_REFUND_MODES,
} from "../../queries/refundQuery";
import { GET_SHIPMENT_DETAILS } from "../../queries/shipmentQuery";

const useRefundManagement = (fpi,{ enabled = true } = {}) => {
  const { showSnackbar } = useSnackbar();
  const [refundOptions, setRefundOptions] = useState([]);
  const [isRefundConfigEnable, setIsRefundConfigEnable] = useState(false);
  const [isRefundModesLoading, setIsRefundModesLoading] = useState(false);
  const [isRefundModesResolved, setIsRefundModesResolved] = useState(false);
  const [refundBreakupSummary, setRefundBreakupSummary] = useState([]);
  const [upiSuggestionList, setUpiSuggestionList] = useState(null);
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refundBeneficiaries, setRefundBeneficiaries] = useState(null);
  const params = useParams();
  const location = useLocation();

  const includesIgnoreCase = (str = "", keyword = "") =>
    str?.toLowerCase().includes(keyword.toLowerCase());

  const fetchRefundModes = async () => {
    const url = window.location.href;
    let match = url.match(/update\/(\d+)\/(return|cancel)/);
    let shipmentId = match?.[1];

    if (!shipmentId) {
      match = url.match(/\/shipment\/(\d+)/);
      shipmentId = match?.[1];
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bagId = Number(urlParams.get("selectedBagId"));
    const bag = shipmentDetails?.bags?.find((item) => item?.id === bagId);
    const lineNumbers = bag ? [bag.line_number] : [];
    if (!shipmentId) {
      showSnackbar("Shipment ID is missing", "error");
      return;
    }
    setIsLoading(true);
    setIsRefundModesLoading(true);
    setIsRefundModesResolved(false);
    try {
      const res = await fpi.executeGQL(GET_REFUND_MODES, {
        shipmentId,
        lineNumbers,
      });

      const { data } = res;
      if (data?.getRefundModes?.refund_options) {
        setRefundOptions(data.getRefundModes.refund_options);
        setIsRefundConfigEnable(data?.getRefundModes?.is_refund_config_enabled);
        setRefundBreakupSummary(data?.getRefundModes);
        const upiOption = data?.getRefundModes?.refund_options?.find((item) =>
          includesIgnoreCase(item.display_name, "upi")
        );
        const upiSuggestionList = upiOption?.suggested_list || [];
        setUpiSuggestionList(upiSuggestionList);
      } else {
        showSnackbar("No refund options available", "error");
      }
    } catch (error) {
      showSnackbar("Failed to fetch refund options", "error");
      setRefundOptions([]);
    } finally {
      setIsLoading(false);
      setIsRefundModesLoading(false);
      setIsRefundModesResolved(true);
    }
  };

  const FetchGetRefundBeneficiaries = async (orderId, shipmentId) => {
    setIsLoading(true);
    try {
      const variables = {
        orderId,
        shipmentId,
      };
      console.log(variables, "variable");

      const res = await fpi.executeGQL(GET_REFUND_BENEFICIARIES, variables);
      console.log(res, "resresres");
      const { data } = res;
      console.log(data, "datadatadatadata");
      const beneficiariesData = data?.refund?.order_user_beneficiaries;
      console.log(beneficiariesData, "beneficiariesDatabeneficiariesData");
      setRefundBeneficiaries(beneficiariesData);
    } catch (error) {
      showSnackbar(
        t("resource.refund_order.failed_to_fetch_refund_options"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    try {
      const values = {
        shipmentId: params.shipmentId || "",
      };

      fpi
        .executeGQL(GET_SHIPMENT_DETAILS, values)
        .then((res) => {
          if (res?.data?.shipment) {
            const data = res?.data?.shipment?.detail;
            setShipmentDetails(data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (!enabled) return;
    if (shipmentDetails?.order_id && shipmentDetails?.shipment_id) {
      fetchRefundModes();
      FetchGetRefundBeneficiaries(
        shipmentDetails.order_id,
        shipmentDetails.shipment_id
      );
    }
  }, [shipmentDetails, enabled]);

  return {
    refundOptions,
    refundBreakupSummary,
    isLoading,
    refundBeneficiaries,
    FetchGetRefundBeneficiaries,
    upiSuggestionList,
    isRefundConfigEnable,
    isRefundModesLoading,
    isRefundModesResolved,
  };
};

export default useRefundManagement;
