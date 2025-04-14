import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import ProfileDetailsPage from "../page-layouts/profile/profile-details-page";

function ProfileDetails({ fpi }) {
  return (
    <ProfileRoot fpi={fpi}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
      >
        <ProfileDetailsPage fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileDetails.authGuard = isLoggedIn;

export const sections = JSON.stringify([]);

export default ProfileDetails;
