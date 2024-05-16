import { useState } from 'react';
import styles from '../styles/Publicaciones.module.css'

const PublicacionFormulario = ({ onSubmit }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        if (imagen) {
            formData.append('imagen', imagen);
        }
        onSubmit(formData);
        setTitulo('');
        setContenido('');
        setImagen(null);

        console.log()
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        setImagen(file);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Nueva Publicación</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="titulo" className={styles.label}>Título:</label>
                    <input
                        type="text"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="contenido" className={styles.label}>Contenido:</label>
                    <textarea
                        id="contenido"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        className={styles.textarea}
                        required
                    ></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="imagen" className={styles.label}>Imagen:</label>
                    <input
                        type="file"
                        id="imagen"
                        accept="image/*"
                        onChange={handleImagenChange}
                        className={styles.inputFile}
                    />
                </div>
                <button type="submit" className={styles.button}>Publicar</button>
            </form>
        </div>
    );
};

export default PublicacionFormulario;
