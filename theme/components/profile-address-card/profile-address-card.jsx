import React from "react";
import styles from "./profile-address-card.less";
import EditIcon from "../../assets/images/edit.svg";
import DeleteIcon from "../../assets/images/delete.svg";

/**
 * ProfileAddressCard Component
 *
 * Displays an address card with edit and delete actions
 *
 * @param {object} address - Address object
 * @param {boolean} isDefault - Whether this is the default address
 * @param {function} onEdit - Callback when edit is clicked
 * @param {function} onDelete - Callback when delete is clicked
 */
function ProfileAddressCard({ address, isDefault, onEdit, onDelete }) {
  const getAddressTag = () => {
    const addressType = address?.address_type || address?.tag;
    if (!addressType) return null;

    return (
      <div className={styles.addressTag}>
        <span className={styles.tagText}>{addressType}</span>
      </div>
    );
  };

  const getFullAddress = () => {
    const parts = [
      address?.address,
      address?.area,
      address?.landmark,
      address?.city,
      address?.state,
      address?.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getPhoneNumber = () => {
    const countryCode = address?.country_code || address?.country_phone_code;
    const phone = address?.phone;

    if (!phone) return null;

    if (countryCode) {
      return `${countryCode}-${phone}`;
    }

    return phone;
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(address?.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(address?.id);
    }
  };

  return (
    <div
      className={`${styles.addressCard} ${
        isDefault ? styles.addressCardDefault : styles.addressCardOther
      }`}
    >
      <div className={styles.addressContent}>
        <div className={styles.addressInfo}>
          <div className={styles.nameTagRow}>
            <span className={styles.addressName}>{address?.name}</span>
            {getAddressTag()}
          </div>

          <p className={styles.addressText}>{getFullAddress()}</p>

          {getPhoneNumber() && (
            <p className={styles.phoneText}>{getPhoneNumber()}</p>
          )}
        </div>
      </div>

      <div className={styles.addressActions}>
        <button
          className={styles.actionButton}
          onClick={handleEdit}
          type="button"
          aria-label="Edit address"
        >
          <EditIcon className={styles.actionIcon} />
        </button>

        <span className={styles.actionDivider}>|</span>

        <button
          className={styles.actionButton}
          onClick={handleDelete}
          type="button"
          aria-label="Delete address"
        >
          <DeleteIcon className={styles.actionIcon} />
        </button>
      </div>
    </div>
  );
}

export default ProfileAddressCard;
