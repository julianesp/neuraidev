"use client";

import React from "react";
import NavBar from "./NavBar";
import Footer from "../containers/Footer";
import styles from "../styles/components/Layout.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";

export default function LayoutClient({ children }) {
  return (
    <ThemeSwitcher>
      <div className={styles.layoutContainer}>
        <NavBar />
        <main id="main-content" className={styles.mainContent}>
          {children}
        </main>
        <Footer />
      </div>
    </ThemeSwitcher>
  );
}
