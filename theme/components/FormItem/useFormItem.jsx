import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CUSTOM_FORM, SUBMIT_CUSTOM_FORM } from "../../queries/formItemQuery";

export const useFormItem = ({ fpi }) => {
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  const getCustomForm = () => {
    setIsLoading(true);
    const payload = {
      slug: params?.slug,
    };

    return fpi
      .executeGQL(CUSTOM_FORM, payload)
      .then((res) => {
        if (res?.errors) {
          throw res?.errors?.[0];
        }
        setFormData(res?.data?.support?.custom_form);
        return res?.data?.support?.custom_form;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFormSubmit = (formValues) => {
    const response = [];
    Object.entries(formValues).forEach(([key, value]) => {
      if (
        typeof value === "object" &&
        value !== null &&
        value.hasOwnProperty("countryCode") &&
        value.hasOwnProperty("mobile") &&
        value.hasOwnProperty("isValidNumber")
      ) {
        response.push({
          key,
          value: {
            code: value.countryCode || "",
            number: value.mobile || "",
            valid: value.isValidNumber ?? false,
          },
        });
      } else {
        response.push({
          key,
          value: value ?? "",
        });
      }
    });

    const payload = {
      slug: params?.slug,
      customFormSubmissionPayloadInput: {
        response,
      },
    };

    return fpi.executeGQL(SUBMIT_CUSTOM_FORM, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.submitCustomForm;
    });
  };

  useEffect(() => {
    getCustomForm();
  }, [params?.slug]);

  return {
    formData,
    isLoading,
    handleFormSubmit,
  };
};
