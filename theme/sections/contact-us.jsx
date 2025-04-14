import React from "react";
import useHeader from "../components/header/useHeader";
import { CREATE_TICKET } from "../queries/supportQuery";
import { useSnackbar } from "../helper/hooks";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import { useFPI } from "fdk-core/utils";
import ContactPage from "@gofynd/theme-template/pages/contact-us/contact-us";
import SocailMedia from "../components/socail-media/socail-media";
import "@gofynd/theme-template/pages/contact-us/contact-us.css";
import { getConfigFromProps } from "../helper/utils";

function Component({ props = {} }) {
  const fpi = useFPI();
  const { contactInfo, supportInfo } = useHeader(fpi);

  const pageConfig = getConfigFromProps(props);

  const { showSnackbar } = useSnackbar();

  const handleSubmitForm = (data) => {
    try {
      let finalText = "";
      if (data?.name) {
        finalText += `<b>Name: </b>${data?.name}<br>`;
      }
      if (data?.phone) {
        finalText += `<b>Contact: </b>${data?.phone}<br>`;
      }
      if (data?.email) {
        finalText += `<b>Email: </b>${data?.email}<br>`;
      }
      if (data?.comment) {
        finalText += `<b>Comment: </b>${data?.comment}<br>`;
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
            title: "Contact Request",
          },
          priority: "low",
        },
      };

      fpi
        .executeGQL(CREATE_TICKET, values)
        .then(() => {
          showSnackbar("Ticket created successfully", "success");
        })
        .catch(() => showSnackbar("Something went wrong", "error"));
    } catch (error) {
      console.error("Error submitting form:", error);
      showSnackbar("An error occurred while submitting the form", "error");
    }
  };

  return (
    <ContactPage
      contactInfo={contactInfo}
      supportInfo={supportInfo}
      handleSubmitForm={handleSubmitForm}
      pageConfig={pageConfig}
      SocailMedia={SocailMedia}
    />
  );
}

export const settings = {
  label: "Contact Us",
  props: [
    {
      id: "align_image",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "right",
          text: "Right",
        },
      ],
      default: "right",
      label: "Banner alignment",
      info: "Select the alignment for the banner",
    },
    {
      type: "image_picker",
      id: "image_desktop",
      label: "Upload banner",
      default: "",
      info: " Upload banner image (Only for desktop)",
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
      label: "Overlay Banner opacity",
      default: 20,
    },
    {
      type: "checkbox",
      id: "show_address",
      default: true,
      label: "Address",
      info: "Show Address",
    },
    {
      type: "checkbox",
      id: "show_phone",
      default: true,
      label: "Phone",
      info: "Show phone number",
    },
    {
      type: "checkbox",
      id: "show_email",
      default: true,
      label: "Email",
      info: "Show Email",
    },
    {
      type: "checkbox",
      id: "show_icons",
      default: true,
      label: "Show social media icons",
      info: "Show Icons",
    },
    {
      type: "checkbox",
      id: "show_working_hours",
      default: true,
      label: "Working Hours",
      info: "Show Working Hours",
    },
  ],
};

export default Component;
