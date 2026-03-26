import React, { useEffect, useState, useCallback } from "react";
import {
  ADD_EMAIL,
  DELETE_EMAIL,
  SEND_VERIFICATION_LINK_TO_EMAIL,
  SET_EMAIL_AS_PRIMARY,
  VERIFY_EMAIL,
} from "../../queries/emailQuery";
import { UPDATE_PROFILE } from "../../queries/authQuery";
import { USER_DATA_QUERY } from "../../queries/libQuery";
import { useGlobalStore } from "fdk-core/utils";

export const useEmail = ({ fpi }) => {
  const { emails, user = {} } = useGlobalStore(fpi.getters.USER_DATA);
  const [emailData, setEmailData] = useState([]);

  useEffect(() => {
    setEmailData(emails ?? user?.emails);
  }, [emails, user?.emails]);

  const sendVerificationLinkToEmail = useCallback(
    (email) => {
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
    },
    [fpi]
  );

  const verifyEmail = useCallback(
    (code) => {
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
    },
    [fpi]
  );

  const setEmailAsPrimary = useCallback(
    (email) => {
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
    },
    [fpi]
  );

  const addEmail = useCallback(
    (email) => {
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
    },
    [fpi]
  );

  const deleteEmail = useCallback(
    (data) => {
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
    },
    [fpi]
  );

  const updateEmail = useCallback(
    async (newEmail) => {
      const id = window.APP_DATA.applicationID;

      const payload = {
        platform: id,
        editProfileRequestSchemaInput: {
          email: newEmail,
        },
      };

      // Capture auth state BEFORE the mutation — UPDATE_PROFILE clears auth.logged_in
      const stateBeforeUpdate = fpi.store?.getState?.() || {};
      const wasLoggedInBefore = stateBeforeUpdate?.auth?.logged_in === true;

      const res = await fpi.executeGQL(UPDATE_PROFILE, payload);

      if (res?.errors) {
        throw res?.errors?.[0];
      }

      const updateProfileData = res?.data?.updateProfile;

      // Check auth state immediately after mutation
      const stateAfterMutation = fpi.store?.getState?.() || {};
      const loggedInAfterMutation =
        stateAfterMutation?.auth?.logged_in === true;

      // Sync updated user data back into the store so other components stay in sync
      const currentUserData = fpi.getters?.USER_DATA?.(stateAfterMutation);
      if (updateProfileData?.user && currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          user: updateProfileData.user,
          first_name: updateProfileData.user.first_name,
          last_name: updateProfileData.user.last_name,
          gender: updateProfileData.user.gender,
        };
        fpi.custom.setValue("user_Data", updatedUserData);
      }

      // CRITICAL: UPDATE_PROFILE clears auth.logged_in — restore it by re-fetching user data
      if (wasLoggedInBefore && !loggedInAfterMutation) {
        try {
          await fpi.executeGQL(USER_DATA_QUERY);
        } catch {
          // non-fatal — session is still valid
        }
      } else if (wasLoggedInBefore && loggedInAfterMutation) {
        fpi.executeGQL(USER_DATA_QUERY).catch(() => {});
      }

      const updatedEmails = updateProfileData?.user?.emails;
      if (updatedEmails) {
        setEmailData(updatedEmails);
      }

      return updateProfileData;
    },
    [fpi]
  );

  return {
    sendVerificationLinkToEmail,
    verifyEmail,
    setEmailAsPrimary,
    addEmail,
    deleteEmail,
    updateEmail,
    emails: emailData,
  };
};
