import React, { useState, useEffect, useRef, useContext } from "react";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../../../room/CustAvatarPopover.scss"
export function Chevron({ isExpanded }) {
  return (
    <div className={styles.chevron}>
      <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
    </div>
  );
}
