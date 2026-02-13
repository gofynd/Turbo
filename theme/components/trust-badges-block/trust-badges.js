import React from "react";
import styles from "./trust-badges.less";
import TrustCard from "../../assets/images/trust-card.png";
import TrusteVerified from "../../assets/images/truste-verified.png";
import VisaVerified from "../../assets/images/verified-by-visa.png";
import Norton from "../../assets/images/norton-antivirus.png";

function TrustBadges() {
  const icons = [
    { src: TrustCard, alt: "Trust Card" },
    { src: TrusteVerified, alt: "Truste Verified" },
    { src: VisaVerified, alt: "Visa Verified" },
    { src: Norton, alt: "Norton" },
  ];
  return (
    <div className={styles.container}>
      <h4 className={`${styles.title} fontHeader`}>
        {" "}
        Secure Shopping Guaranteed
      </h4>
      <div className={styles.badgeBox}>
        {icons.map((icon, index) => (
          <div key={index} className={styles.iconWrapper}>
            <img src={icon.src} alt={icon.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBadges;
