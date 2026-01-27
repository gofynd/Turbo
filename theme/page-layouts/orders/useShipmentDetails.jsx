import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  GET_SHIPMENT_DETAILS,
  SHIPMENT_REASONS,
  SHIPMENT_INVOICE,
  UPDATE_SHIPMENT_STATUS,
  UPDATE_DEFAULT_BENEFICIARY,
} from "../../queries/shipmentQuery";
import { useSnackbar } from "../../helper/hooks";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";

const useShipmentDetails = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [reasonsList, setReasonsList] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [showPolling, setShowPolling] = useState(false);

  const fetchShipmentDetails = useCallback(() => {
    const values = {
      shipmentId: params.shipmentId || "",
    };

    return fpi
      .executeGQL(GET_SHIPMENT_DETAILS, values)
      .then((res) => {
        if (res?.data?.shipment?.detail) {
          const data = res?.data?.shipment?.detail;
          setShipmentDetails(data);
          setShowPolling(false);
          setIsLoading(false);
          setAttempts(0);

          // Check if we're on a cancel page and shipment is already cancelled
          const isCancelPage = location.pathname.includes("/cancel");
          if (isCancelPage && !data?.can_cancel && data?.shipment_id) {
            // Redirect to the shipment details page if already cancelled
            navigate(`/profile/orders/shipment/${data.shipment_id}`);
          }
        } else {
          setAttempts((prev) => {
            const newAttempts = prev + 1;
            if (newAttempts >= 5) {
              setIsLoading(false);
              setShowPolling(true);
            }
            return newAttempts;
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log({ error });
        setAttempts((prev) => {
          const newAttempts = prev + 1;
          if (newAttempts >= 5) {
            setIsLoading(false);
            setShowPolling(true);
          }
          return newAttempts;
        });
      });
  }, [params.shipmentId, fpi, location.pathname, navigate]);

  useEffect(() => {
    // Reset state when shipmentId or location.search changes
    if (params.shipmentId) {
      setShipmentDetails({});
      setAttempts(0);
      setShowPolling(false);
      setIsLoading(true);
    }
  }, [params.shipmentId, location.search]);

  useEffect(() => {
    if (params.shipmentId && isLoading) {
      let timeoutId;
      if (attempts < 5) {
        timeoutId = setTimeout(() => {
          fetchShipmentDetails();
        }, 2000);
      } else {
        setShowPolling(true);
        setIsLoading(false);
      }
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [
    params.shipmentId,
    location.search,
    isLoading,
    attempts,
    fetchShipmentDetails,
  ]);

  function getBagReasons(bagObj) {
    setIsLoading(true);
    try {
      fpi
        .executeGQL(SHIPMENT_REASONS, bagObj)
        .then((res) => {
          if (res?.data?.shipment) {
            const data = res?.data?.shipment?.shipment_bag_reasons;
            setReasonsList(data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
      setIsLoading(false);
    }
  }

  function getInvoice(bagObj) {
    try {
      fpi.executeGQL(SHIPMENT_INVOICE, bagObj).then((res) => {
        if (res?.data?.shipment) {
          const data = res?.data?.shipment?.invoice_detail;
          setInvoiceDetails(data);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
    }
  }

  async function updateShipment(
    payload,
    type,
    refundOptions = [],
    orderId = ""
  ) {
    setIsLoading(true);
    try {
      // First call UPDATE_DEFAULT_BENEFICIARY if beneficiary_id exists
      if (payload.beneficiary_id) {
        try {
          const beneficiaryPayload = {
            setDefaultBeneficiaryRequestInput: {
              beneficiary_id: payload.beneficiary_id,
              order_id: payload.order_id,
              shipment_id: payload.shipmentId,
            },
          };

          const beneficiaryRes = await fpi.executeGQL(
            UPDATE_DEFAULT_BENEFICIARY,
            beneficiaryPayload
          );

          if (beneficiaryRes?.data?.updateDefaultBeneficiary?.success) {
            console.log("Default beneficiary updated successfully");
          } else {
            const errorMessage =
              beneficiaryRes?.errors?.[0]?.message ||
              "Failed to update default beneficiary";
            showSnackbar(errorMessage, "error");
            setIsLoading(false);
            return;
          }
        } catch (beneficiaryError) {
          const errorMessage =
            beneficiaryError?.message || "Failed to update default beneficiary";
          showSnackbar(errorMessage, "error");
          setIsLoading(false);
          return;
        }
      }

      // Proceed with UPDATE_SHIPMENT_STATUS only if beneficiary update succeeded or no beneficiary to update
      const res = await fpi.executeGQL(UPDATE_SHIPMENT_STATUS, payload);
      if (
        res?.data?.updateShipmentStatus?.statuses[0]?.shipments[0]?.status ===
        200
      ) {
        const newShipmentId =
          res?.data?.updateShipmentStatus?.statuses[0]?.shipments[0]
            ?.final_state?.shipment_id;

        if (type === "return") {
          if (newShipmentId) {
            setTimeout(() => {
              setIsLoading(false);
              navigate(`/return/order/${orderId}/shipment/${newShipmentId}`);
            }, 1000);
          }
          showSnackbar(t("resource.order.return_accepted"), "success");
        }

        if (type === "cancel") {
          if (newShipmentId) {
            setTimeout(() => {
              setIsLoading(false);
              navigate(`/profile/orders/shipment/${newShipmentId}`);
            }, 1000);
          }
          showSnackbar("order cancelled", "success");
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
    }
  }

  const refetchShipmentDetails = async () => {
    setIsLoading(true);
    try {
      const values = {
        shipmentId: params.shipmentId,
      };
      const res = await fpi.executeGQL(GET_SHIPMENT_DETAILS, values);
      if (res?.data?.shipment) {
        const data = res?.data?.shipment?.detail;
        setShipmentDetails({ ...data });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    shipmentDetails,
    invoiceDetails,
    reasonsList,
    getBagReasons,
    getInvoice,
    updateShipment,
    refetchShipmentDetails,
    refetch: fetchShipmentDetails,
    showPolling,
  };
};

export default useShipmentDetails;
