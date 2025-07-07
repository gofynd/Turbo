import React from "react";
import useHeader from "../components/header/useHeader";
import { CREATE_TICKET } from "../queries/supportQuery";
import { useSnackbar } from "../helper/hooks";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import ContactPage from "@gofynd/theme-template/pages/contact-us/contact-us";
import SocailMedia from "../components/socail-media/socail-media";
import "@gofynd/theme-template/pages/contact-us/contact-us.css";
import { getConfigFromProps } from "../helper/utils";
import { useLocation } from "react-router-dom";

function Component({ props = {} }) {
  const fpi = useFPI();
  const { contactInfo, supportInfo, appInfo } = useHeader(fpi);
  const { t } = useGlobalTranslation("translation");

  const pageConfig = getConfigFromProps(props);
  const { showSnackbar } = useSnackbar();

  const getPrefillData = (search) => {
    const params = new URLSearchParams(search);

    const sanitize = (val) =>
      decodeURIComponent(val || "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/^"|"$/g, "")
        .trim();

    const isValidEmail = (val) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,6}){1,2}$/.test(val);

    const isValidPhone = (val) => /^\+?[0-9\s]{6,15}$/.test(val);

    const isValidName = (val) => /^[a-zA-Z0-9\s.'-]{2,50}$/.test(val);

    const isValidComment = (val) =>
      typeof val === "string" && val.length <= 500;

    const rawName = sanitize(params.get("name"));
    const rawPhone = sanitize(params.get("phone"));
    const rawEmail = sanitize(params.get("email"));
    const rawComment = sanitize(params.get("message"));

    return {
      values: {
        name: rawName,
        phone: rawPhone,
        email: rawEmail,
        comment: rawComment,
      },
      errors: {
        name: rawName && !isValidName(rawName),
        phone: rawPhone && !isValidPhone(rawPhone),
        email: rawEmail && !isValidEmail(rawEmail),
        comment: rawComment && !isValidComment(rawComment),
      },
    };
  };

  const location = useLocation();
  const prefillData = getPrefillData(location.search);

  const handleSubmitForm = (data) => {
    try {
      let finalText = "";
      if (data?.name) {
        finalText += `<b>${t("resource.header.shop_logo_alt_text")}: </b>${data?.name}<br>`;
      }
      if (data?.phone) {
        finalText += `<b>${t("resource.header.contact")}: </b>${data?.phone}<br>`;
      }
      if (data?.email) {
        finalText += `<b>${t("resource.common.email")}: </b>${data?.email}<br>`;
      }
      if (data?.comment) {
        finalText += `<b>${t("resource.header.comment")}: </b>${data?.comment}<br>`;
      }
      finalText = `<div>${finalText}</div>`;
      const wordArray = Utf8.parse(finalText);
      finalText = Base64.stringify(wordArray);
      const values = {
        addTicketPayloadInput: {
          _custom_json: {
            comms_details: {
              name: data?.name,
              email: data?.email,
              phone: data?.phone,
            },
          },
          category: "contact-us",
          content: {
            attachments: [],
            description: finalText,
            title: t("resource.header.contact_request"),
          },
          priority: "low",
        },
      };

      fpi
        .executeGQL(CREATE_TICKET, values)
        .then(() => {
          showSnackbar(t("resource.common.ticket_success"), "success");
        })
        .catch(() => showSnackbar(t("resource.common.error_message"), "error"));
    } catch (error) {
      console.error("Error submitting form:", error);
      showSnackbar(
        t("resource.common.error_occurred_submitting_form"),
        "error"
      );
    }
  };
  console.log(pageConfig, "pageConfig");

  return (
    <ContactPage
      contactInfo={contactInfo}
      supportInfo={supportInfo}
      handleSubmitForm={handleSubmitForm}
      pageConfig={pageConfig}
      SocailMedia={SocailMedia}
      appInfo={appInfo}
      prefillData={prefillData}
    />
  );
}

export const settings = {
  label: "t:resource.sections.contact_us.contact_us",
  props: [
    {
      id: "align_image",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.left",
        },
        {
          value: "right",
          text: "t:resource.common.right",
        },
      ],
      default: "right",
      label: "t:resource.sections.contact_us.banner_alignment",
      info: "t:resource.sections.contact_us.banner_alignment_info",
    },
    {
      id: "align_description",
      type: "select",
      options: [
        {
          value: "below_header",
          text: "t:resource.sections.contact_us.below_header",
        },
        {
          value: "above_footer",
          text: "t:resource.sections.contact_us.above_footer",
        },
      ],
      default: "below_header",
      label: "t:resource.sections.contact_us.description_alignment",
      info: "t:resource.sections.contact_us.description_alignment_info",
    },
    {
      type: "image_picker",
      id: "image_desktop",
      label: "t:resource.sections.contact_us.upload_banner",
      default: "",
      info: "t:resource.sections.contact_us.upload_banner_info",
      options: {
        aspect_ratio: "3:4",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "range",
      id: "opacity",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      label: "t:resource.sections.contact_us.overlay_banner_opacity",
      default: 20,
    },
    {
      type: "checkbox",
      id: "show_description",
      default: true,
      label: "t:resource.sections.contact_us.description",
      info: "t:resource.sections.contact_us.show_description",
    },
    {
      type: "checkbox",
      id: "show_address",
      default: true,
      label: "t:resource.sections.contact_us.address",
      info: "t:resource.sections.contact_us.show_address",
    },
    {
      type: "checkbox",
      id: "show_phone",
      default: true,
      label: "t:resource.sections.contact_us.phone",
      info: "t:resource.sections.contact_us.show_phone",
    },
    {
      type: "checkbox",
      id: "show_email",
      default: true,
      label: "t:resource.sections.contact_us.email",
      info: "t:resource.sections.contact_us.show_email",
    },
    {
      type: "checkbox",
      id: "show_icons",
      default: true,
      label: "t:resource.sections.contact_us.social_media_icons",
      info: "t:resource.sections.contact_us.show_icons",
    },
    {
      type: "checkbox",
      id: "show_working_hours",
      default: true,
      label: "t:resource.sections.contact_us.working_hours",
      info: "t:resource.sections.contact_us.show_working_hours",
    },
  ],
};

export default Component;
