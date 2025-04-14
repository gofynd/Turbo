import React from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import ProfileAddressPage from "../page-layouts/profile-address/profile-address-page";

function ProfileAddress({ fpi }) {
  return (
    <ProfileRoot fpi={fpi}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
        style={{ height: "100%" }}
      >
        <ProfileAddressPage fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileAddress.authGuard = isLoggedIn;

export default ProfileAddress;
