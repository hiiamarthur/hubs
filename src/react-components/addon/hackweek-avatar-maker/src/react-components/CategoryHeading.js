import React from "react";

import { Thumbnail } from "./Thumbnail";
import { Chevron } from "./Chevron";
import styles from "../../../../room/CustAvatarPopover.scss"
export function CategoryHeading({ categoryName, onClick, isExpanded, selectedPartName, image }) {
  return (
    // <div className="categoryHeading" onClick={onClick}>
    <div className={styles.categoryHeading} onClick={onClick}>
      <h2 className={styles.categoryName}>{categoryName}</h2>
      <Chevron {...{ isExpanded }} />
      <h2 className={styles.selectedPartName}>{selectedPartName}</h2>
      <Thumbnail image={image} />
    </div>
  );
}
