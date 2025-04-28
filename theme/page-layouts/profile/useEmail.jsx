import React, { useEffect, useState } from "react";
import {
  ADD_EMAIL,
  DELETE_EMAIL,
  SEND_VERIFICATION_LINK_TO_EMAIL,
  SET_EMAIL_AS_PRIMARY,
  VERIFY_EMAIL,
} from "../../queries/emailQuery";
import { useGlobalStore } from "fdk-core/utils";

export const useEmail = ({ fpi }) => {
  const { emails, user = {} } = useGlobalStore(fpi.getters.USER_DATA);
  const [emailData, setEmailData] = useState([]);

  useEffect(() => {
    setEmailData(emails ?? user?.emails);
  }, [emails, user?.emails]);

  const sendVerificationLinkToEmail = (email) => {
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      editEmailRequestSchemaInput: {
        email,
      },
    };

    return fpi
      .executeGQL(SEND_VERIFICATION_LINK_TO_EMAIL, payload)
      .then((res) => {
        if (res?.errors) {
          throw res?.errors?.[0];
        }
        return res?.data?.sendVerificationLinkToEmail;
      });
  };

  const verifyEmail = (code) => {
    const payload = {
      codeRequestBodySchemaInput: {
        code,
      },
    };

    return fpi.executeGQL(VERIFY_EMAIL, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.verifyEmail;
    });
  };

  const setEmailAsPrimary = (email) => {
    const payload = {
      editEmailRequestSchemaInput: {
        email,
      },
    };

    return fpi.executeGQL(SET_EMAIL_AS_PRIMARY, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      setEmailData(res?.data?.setEmailAsPrimary?.user?.emails);
      return res?.data?.setEmailAsPrimary;
    });
  };

  const addEmail = (email) => {
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      editEmailRequestSchemaInput: {
        email,
      },
    };
    return fpi.executeGQL(ADD_EMAIL, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      setEmailData(res?.data?.addEmail?.user?.emails);
      return res?.data?.addEmail;
    });
  };

  const deleteEmail = (data) => {
    const id = window.APP_DATA.applicationID;

    const payload = {
      ...data,
      platform: id,
    };

    return fpi.executeGQL(DELETE_EMAIL, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      setEmailData(res?.data?.deleteEmail?.user?.emails);
      return res?.data?.deleteEmail;
    });
  };

  return {
    sendVerificationLinkToEmail,
    verifyEmail,
    setEmailAsPrimary,
    addEmail,
    deleteEmail,
    emails: emailData,
  };
};
