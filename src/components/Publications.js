import Image from "next/image"
import styles from "@/styles/Publications.module.css"

const Publicaciones = () => {
    return (
        <>
            <section className="title">
                <h3>Imagen</h3>
            </section>

            <section className="description">
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Error similique libero aut laboriosam doloremque aliquid autem inventore est reprehenderit illum totam officia, magni laborum ipsam at soluta recusandae? Nulla, sit!
                </p>
            </section>

            <section className={`${'image'} ${styles}`}>
                <Image
                    className={styles.image__muestra}
                    alt="Image de muestra"
                    src="/images/doc.jpg"
                    width={150}
                    height={150}
                />
            </section>
        </>
    )
}

export default Publicaciones