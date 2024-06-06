import NavBar from "../containers/NavBar.js";
import Footer from "../containers/Footer.js";
import styles from "../styles/Layout.module.css";
import { Html, Main, Head } from "next/document.js";

const Layout = ({ children }) => (
  <>
    <NavBar />
    <Main>
      <main className={styles.mein}>{children}</main>
    </Main>

    <Footer />
  </>
);

export default Layout;
