// extension formatear codigo en vscode
import React from 'react'
import styles from '../styles/Logo.module.css'

const Logo = () => {
  return (
    <div className={styles.face}>

        <div class="frente"></div>

        <div class="hair">
            <div class="hair_1" id="parte"></div>

            <div class="hair_2"></div>
            <div class="hair_3"></div>
            <div class="hair_4"></div>
            <div class="hair_5"></div>
        </div>
        <div class="robot">
            {/* parche al ojo */}
        </div>

        <div class="ears">
            <div class="ear-left"></div>
            <div class="ear-right"></div>
        </div>


        <div class="eye">
            <div class="eye-left">
                <div class="cerrar"></div>
                <div class="eyelash left"></div>
                <div class="iris"></div>
            </div>
            <div class="eye-right">
                <div class="eyelash right"></div>
                <div class="iris"></div>
            </div>

        </div>




        <div class="nose">
            <div class="left"></div>
            <div class="right"></div>
        </div>

        <div class="mouth">
            <div class="up">
                <div class="left"></div>
                <div class="right"></div>
            </div>
            <div class="down"></div>
        </div>

        <div class="menton">
        </div>

    </div>
  )
}

export default Logo
    



    



