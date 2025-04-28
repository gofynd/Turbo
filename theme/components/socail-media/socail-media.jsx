import React from "react";
import styles from "./socail-media.less";
import SocailTwitter from "../../assets/images/socail-twitter.svg";
import SocailFacebook from "../../assets/images/socail-facebook.svg";
import SocailGoogle from "../../assets/images/socail-google+.svg";
import SocailVimeo from "../../assets/images/socail-vimeo.svg";
import SocailBlog from "../../assets/images/socail-blog.svg";
import SocailInstagram from "../../assets/images/socail-instagram.svg";
import SocailLinkedin from "../../assets/images/socail-linkedin.svg";
import SocailYoutube from "../../assets/images/socail-youtube.svg";
import SocailPinterest from "../../assets/images/socail-pinterest.svg";
import { FDKLink } from "fdk-core/components";

const iconMap = {
  social_twitter: SocailTwitter,
  social_facebook: SocailFacebook,
  social_pinterest: SocailPinterest,
  social_google_plus: SocailGoogle,
  social_blog_link: SocailBlog,
  social_instagram: SocailInstagram,
  social_youtube: SocailYoutube,
  social_vimeo: SocailVimeo,
  social_linked_in: SocailLinkedin,
};

export default function SocailMedia({ social_links, customClassName }) {
  function getSocialIcon(key) {
    const SocialIcon = iconMap[key];
    return !!SocialIcon ? <SocialIcon /> : <></>;
  }
  return (
    <div className={`${styles.iconsContainer} ${customClassName}`}>
      {Object.entries(social_links).map(
        ([key, { link, title }]) =>
          link && (
            <FDKLink
              key={key}
              to={link}
              target="_blank"
              title={title}
              className={styles.socialLink}
            >
              {getSocialIcon(`social_${key}`)}
            </FDKLink>
          )
      )}
    </div>
  );
}
