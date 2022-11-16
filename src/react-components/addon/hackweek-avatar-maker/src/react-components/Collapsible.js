import React from "react";
import styles from "../../../../room/CustAvatarPopover.scss"
export function Collapsible({ children }) {
  return <div className={styles.collapsible}>{children}</div>;
}
