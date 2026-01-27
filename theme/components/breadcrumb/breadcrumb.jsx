/**
 * Renders a breadcrumb navigation component.
 *
 * @param {Object} props - The properties object.
 * @param {Array} [props.breadcrumb=[]] - An array of breadcrumb items, where each item is an object containing `link` and `label` properties.
 * @returns {JSX.Element} A JSX element representing the breadcrumb navigation.
 */

import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./breadcrumb.less";

const Breadcrumb = ({ breadcrumb = [] }) => {
  const itemsList = breadcrumb?.slice(0, breadcrumb?.length - 1);

  return (
    <div className={styles.breadcrumbs}>
      {itemsList.map((item, index) => (
        <span key={index}>
          <FDKLink to={item?.link}>{item?.label}</FDKLink>&nbsp; / &nbsp;
        </span>
      ))}
      <span className={styles.active}>
        {breadcrumb?.[breadcrumb?.length - 1]?.label}
      </span>
    </div>
  );
};

export default Breadcrumb;
