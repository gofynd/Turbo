import React from "react";
import FormBuilder from "fdk-react-templates/components/form-builder/form-builder";
import "fdk-react-templates/components/form-builder/form-builder.css";
import { useFormItem } from "./useFormItem";

const FormItem = ({ fpi }) => {
  const { formData, handleFormSubmit, isLoading } = useFormItem({ fpi });

  return (
    <FormBuilder
      data={formData}
      onFormSubmit={handleFormSubmit}
      isLoading={isLoading}
    />
  );
};

export default FormItem;
