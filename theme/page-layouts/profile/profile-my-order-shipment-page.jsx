import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import ProfileRoot from "../../components/profile/profile-root";
import { useThemeConfig } from "../../helper/hooks";
import { useGlobalTranslation } from "fdk-core/utils";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";

function ProfileMyOrderShipmentPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  const orderInfoLabel = useMemo(() => {
    const translated = t("resource.order.order_information");
    if (!translated || translated.startsWith("resource.")) {
      return "Order Information";
    }
    return translated;
  }, [t]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.my_orders"), link: "/profile/orders" },
      { label: orderInfoLabel },
    ],
    [t, orderInfoLabel]
  );

  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  return (
    page?.value === "shipment-details" && (
      <ProfileRoot
        fpi={fpi}
        leftSections={leftSections}
        rightSections={rightSections}
        globalConfig={globalConfig}
      >
        <Breadcrumb breadcrumb={breadcrumbItems} />
        <motion.div
          key={page?.value}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          className="basePageContainer margin0auto"
        >
          {leftSections.length > 0 && (
            <SectionRenderer
              sections={leftSections}
              fpi={fpi}
              blocks={[]}
              preset={{}}
              globalConfig={globalConfig}
            />
          )}
        </motion.div>
      </ProfileRoot>
    )
  );
}

export default ProfileMyOrderShipmentPage;
