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
    const payload = {
      slug: params?.slug,
      customFormSubmissionPayloadInput: {
        response: Object.keys(formValues).reduce(
          (acc, key) => [...acc, { key, value: formValues?.[key] || "" }],
          []
        ),
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
  }, []);

  return {
    formData,
    isLoading,
    handleFormSubmit,
  };
};
