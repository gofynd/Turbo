import React, { useState, useEffect } from "react";
import {
  DELETE_MOBILE_NUMBER,
  SET_MOBILE_NUMBER_AS_PRIMARY,
} from "../../queries/phoneQuery";
import { useGlobalStore } from "fdk-core/utils";

export const usePhone = ({ fpi }) => {
  const { phone_numbers, user = {} } = useGlobalStore(fpi.getters.USER_DATA);

  const [phoneNumbers, setPhoneNumbers] = useState([]);

  useEffect(() => {
    setPhoneNumbers(phone_numbers ?? user?.phone_numbers);
  }, [phone_numbers, user?.phone_numbers]);

  const setMobileNumberAsPrimary = (data) => {
    const { active, country_code, phone, primary, verified } = data;

    const sendVerificationLinkMobileRequestSchemaInput = {
      active,
      country_code: country_code?.toString(),
      phone,
      primary,
      verified,
    };

    const payload = {
      sendVerificationLinkMobileRequestSchemaInput,
    };

    return fpi.executeGQL(SET_MOBILE_NUMBER_AS_PRIMARY, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      setPhoneNumbers(res?.data?.setMobileNumberAsPrimary?.user?.phone_numbers);
      return res?.data?.setMobileNumberAsPrimary;
    });
  };

  const deleteMobileNumber = (data) => {
    const id = window.APP_DATA.applicationID;

    const payload = {
      ...data,
      countryCode: data?.country_code?.toString(),
      platform: id,
    };

    return fpi.executeGQL(DELETE_MOBILE_NUMBER, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      setPhoneNumbers(res?.data?.deleteMobileNumber?.user?.phone_numbers);
      return res?.data?.deleteMobileNumber;
    });
  };

  return {
    setMobileNumberAsPrimary,
    deleteMobileNumber,
    phoneNumbers,
  };
};
