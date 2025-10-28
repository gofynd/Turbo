import React from "react";
import FormBuilder from "@gofynd/theme-template/components/form-builder/form-builder";
import "@gofynd/theme-template/components/form-builder/form-builder.css";
import { useFormItem } from "./useFormItem";

const FormItem = ({ fpi }) => {
  const { formData, handleFormSubmit, isLoading, successMessage } = useFormItem(
    { fpi }
  );

  return (
    <FormBuilder
      data={formData}
      onFormSubmit={handleFormSubmit}
      successMessage={successMessage}
      isLoading={isLoading}
    />
  );
};

export default FormItem;
