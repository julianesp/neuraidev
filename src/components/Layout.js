import NavBar from '../containers/NavBar.js';
import Footer from '../containers/Footer.js';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => (
    <>
        <NavBar />

        <main className={styles.mein}>
            {children}
        </main>
        <Footer />
    </>
)

export default Layout