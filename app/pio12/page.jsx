'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Base de datos de empleados (generada desde USUARIOS ACTIVOS COLON 2026.xlsx) ───
const EMPLEADOS = [
  { nombre: "Ortega Ñustez Ferney Ramiro Ortega", descripcion: "FISIOTERAPEUTA EBS 3 SANTIAGO", celular: "3187677477" },
  { nombre: "Rico Levi Paola Caterine", descripcion: "GESTOR COMUNITARIO EBS 5 SIBUNDOY", celular: "3224043106" },
  { nombre: "Rico Levi Paola Caterine", descripcion: "GESTOR COMUNITARIO EBS 5 SIBUNDOY", celular: "3219500425" },
  { nombre: "Jacanamijoy Tisoy Elizabeth Josefin", descripcion: "GESTOR COMUNITARIO EBS 3 SANTIAGO", celular: "3237722820" },
  { nombre: "Insuasty Villota Rocio Pilar", descripcion: "", celular: "3232073402" },
  { nombre: "Tatamues Yelitza", descripcion: "", celular: "3117006941" },
  { nombre: "Jasbleidy Valentina Bravo Gomez", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3116230632" },
  { nombre: "Jasbleidy Valentina Bravo Gomez", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3232317906" },
  { nombre: "Zamudio Medina Yamile Andrea", descripcion: "JEFE DE ENFERMERIA", celular: "3126188835" },
  { nombre: "Yolima Del Rocio Lopez Lagos", descripcion: "FACTURACION URGENCIAS", celular: "3128446130" },
  { nombre: "Rodriguez Quintana Yeisson David", descripcion: "", celular: "3219711856" },
  { nombre: "Ortiz Chamorro Fanny Estella", descripcion: "", celular: "3108873598" },
  { nombre: "Ortiz Chamorro Fanny Estella", descripcion: "", celular: "3176348744" },
  { nombre: "Ortiz Martinez Liseth Fernanda", descripcion: "EBS 1 JSIBUNDOY EFE", celular: "3167436213" },
  { nombre: "Ortiz Martinez Liseth Fernanda", descripcion: "EBS 1 JSIBUNDOY EFE", celular: "3135607354" },
  { nombre: "Vallejo Burbano Tania Xiomara", descripcion: "MEDICO EBS 1 SIBUNDOY", celular: "3239778364" },
  { nombre: "Luz Angélica Teran Alvarado", descripcion: "AUXILIAR ENFERMERIA", celular: "3203961050" },
  { nombre: "Salas Erazo Erika Daniela", descripcion: "JEFE DE ENFERMERIA MATERNO PERINATAL", celular: "3238456311" },
  { nombre: "Bravo Castro Julisa Natalia", descripcion: "", celular: "3105121952" },
  { nombre: "Morales Benavides Katerin Alejandra", descripcion: "EBS 1 SANTIAGO FISIOTERAPEUTA", celular: "3134348062" },
  { nombre: "Benavides Tisoy Camila Fernanda", descripcion: "FONOAUDIOLOGA", celular: "3116812926" },
  { nombre: "Jiselle Catalina Chamorro", descripcion: "AUXILIAR ENFERMERIA EQUIPOS BASICOS", celular: "3142413589" },
  { nombre: "Ponce Vallejo Nancy Magaly", descripcion: "", celular: "3219562105" },
  { nombre: "Sanchez Jacanamijoy Erika Fernanda", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3202696001" },
  { nombre: "Quinchoa Quinchoa Dayra Magaly", descripcion: "AUX ENFERMERIA EBS 3 COLON", celular: "3128949601" },
  { nombre: "Cordoba Gomajoa Angela Jurany", descripcion: "", celular: "3163611349" },
  { nombre: "Chindoy Chindoy Oscar Fabian", descripcion: "AUX ENFERMERIA EBS 1 SIBUNDOY", celular: "3182198257" },
  { nombre: "Paz Lina Marcela", descripcion: "AUXILIAR DE ENFERMERIA EBS 1 SIBUNDOY", celular: "3219846482" },
  { nombre: "Paz Lina Marcela", descripcion: "AUXILIAR DE ENFERMERIA EBS 1 SIBUNDOY", celular: "3157009166" },
  { nombre: "Morales Vanegas Nayeli Alejandra", descripcion: "AUXILIAR DE ENFERMERIA SAN FRANCISCO EBS 1", celular: "3204423961" },
  { nombre: "Delgado Caicedo Nanci Soraida", descripcion: "", celular: "3148002583" },
  { nombre: "Bastidas Unigarro Mayerli Sofia", descripcion: "", celular: "3223462262" },
  { nombre: "Bastidas Unigarro Mayerli Sofia", descripcion: "", celular: "3209083255" },
  { nombre: "Ortega Alba Irene", descripcion: "citas medicas sibundoy", celular: "3132038879" },
  { nombre: "Gloria Esperanza Maigual Juagibioy", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3113259436" },
  { nombre: "Ortega Vallejo Camila Doreidy", descripcion: "FACTIRADORA", celular: "3233094211" },
  { nombre: "Ortega Vallejo Camila Doreidy", descripcion: "FACTIRADORA", celular: "3162708119" },
  { nombre: "Maria Alejandra Rojas Salas", descripcion: "FACTURACION COLON EQUIPO BASICO", celular: "3116527472" },
  { nombre: "Nati Navia Adriana Yaqueline", descripcion: "", celular: "3184668403" },
  { nombre: "Chamorro Zambrano Gonzalo Raul", descripcion: "", celular: "3148244285" },
  { nombre: "Belalcazar Bravo Ana Maria", descripcion: "", celular: "3202798441" },
  { nombre: "Belalcazar Bravo Ana Maria", descripcion: "", celular: "3235195495" },
  { nombre: "Claudia Rocio Narvaez Jamioy", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3204178796" },
  { nombre: "Erika Margarita Botina Pantoja", descripcion: "HIGIENISTA ORAL", celular: "3118542856" },
  { nombre: "Revelo Mera Adriana Lucia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3134759885" },
  { nombre: "Revelo Mera Adriana Lucia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3161199933" },
  { nombre: "Moran Mora Maria Paula", descripcion: "", celular: "3188602519" },
  { nombre: "Manguay Rosero Aleyda Dolores", descripcion: "", celular: "3135392094" },
  { nombre: "Carmona Rodriguez Julian David", descripcion: "", celular: "3104683570" },
  { nombre: "Campo Edgar Ferando", descripcion: "ODONTOLOGO", celular: "3212266020" },
  { nombre: "Martinez Ordoñez Omaira Margoth", descripcion: "FACTURADOR", celular: "3122419926" },
  { nombre: "Karen Valentina Imues Rosero", descripcion: "FACTURACION", celular: "3115344275" },
  { nombre: "Karen Valentina Imues Rosero", descripcion: "FACTURACION", celular: "3116269119" },
  { nombre: "Enriquez Osorio Angela", descripcion: "", celular: "3233441068" },
  { nombre: "Chasoy Chasoy Alba Patricia", descripcion: "", celular: "3111040449" },
  { nombre: "Chasoy Edy Carmenza", descripcion: "", celular: "3209020092" },
  { nombre: "Chasoy Edy Carmenza", descripcion: "", celular: "3147111769" },
  { nombre: "Benavidez Gomez Liseth Viviana", descripcion: "PSICOLOGA EBS 3 SAN FRANCISCO", celular: "3138695853" },
  { nombre: "Agreda Botina Esperanza", descripcion: "AUXILIAR  ENFERMERIA EB 1 COLON", celular: "3148834808" },
  { nombre: "Lasso Jacanamejoy Carlos Jesus", descripcion: "AUXILIAR ENFERMERIA EBS 1 COLON", celular: "3104921411" },
  { nombre: "Bravo Narváez Kelly Tatiana", descripcion: "", celular: "3175487619" },
  { nombre: "Mojomboy Mojomboy Ruth Marleny", descripcion: "AUX ENFERMERIA EBS 3 SANTIAGO", celular: "3163227128" },
  { nombre: "Mojomboy Mojomboy Ruth Marleny", descripcion: "AUX ENFERMERIA EBS 3 SANTIAGO", celular: "3104341180" },
  { nombre: "Guerrero Laura Sofia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3213339811" },
  { nombre: "Mutumbajoy Chicunque Ana Maria", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3228690317" },
  { nombre: "Chindoy Luna Marjory Del Carmen", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3138715380" },
  { nombre: "Jamioy Tandioy Maria Esperanza", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 SAN FRANCISCO", celular: "9999999999" },
  { nombre: "Jamioy Tandioy Maria Esperanza", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 SAN FRANCISCO", celular: "3122017580" },
  { nombre: "Pabon Riascos Clara Ines", descripcion: "FISIOTERAPEUTA", celular: "3212509403" },
  { nombre: "Cuellar Portilla Dayana Estefany", descripcion: "", celular: "3002596210" },
  { nombre: "Cuellar Lopez Angela Juliana", descripcion: "", celular: "3203876701" },
  { nombre: "Otaya Pastas Zharik Tatiana", descripcion: "", celular: "3133746086" },
  { nombre: "Otaya Pastas Zharik Tatiana", descripcion: "", celular: "3222152553" },
  { nombre: "Ortiz Paz Maria Cristina", descripcion: "", celular: "3155235850" },
  { nombre: "Ortiz Paz Maria Cristina", descripcion: "", celular: "3155363561" },
  { nombre: "Tello Jojoa Camila Andrea", descripcion: "FACTURADORA APOYO", celular: "3142410552" },
  { nombre: "Morales Jamioy Natalia Caterin", descripcion: "", celular: "3104816864" },
  { nombre: "Morales Jamioy Natalia Caterin", descripcion: "", celular: "3184575124" },
  { nombre: "Bacca Pejendino Yubeli", descripcion: "HOSPITALIZACION Y URGENCIAS", celular: "3136699659" },
  { nombre: "Diana Karolina Pantoja Lopez", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3209029164" },
  { nombre: "Diana Karolina Pantoja Lopez", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3134114037" },
  { nombre: "Noguera Ibarra Disney Katherine", descripcion: "AUXILIAR DE ENFERMERIA  DEMANDA INDUCIDA SIBUNDOY", celular: "3147206447" },
  { nombre: "Jimenez Narvaez Olga Valentina", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3135217612" },
  { nombre: "Coral Muñoz Deimar Alejandra", descripcion: "", celular: "3138628121" },
  { nombre: "Rosero Pejendino Jimy Fabian", descripcion: "", celular: "3228984428" },
  { nombre: "Marcela Torres Moreno", descripcion: "ESTADISTICA", celular: "3108358360" },
  { nombre: "Muñoz Ramos Olga Milena", descripcion: "", celular: "3116081267" },
  { nombre: "Chasoy Jacanamejoy Jose", descripcion: "SABEDOR", celular: "3124567894" },
  { nombre: "Chindoy Chasoy Heiner Fabian", descripcion: "PROMOTOR", celular: "3144244254" },
  { nombre: "Mavisoy Mavisoy Maria Dolores", descripcion: "", celular: "3133761804" },
  { nombre: "Benavides Revelo Solay Marisol", descripcion: "PROMOTOR", celular: "3146592185" },
  { nombre: "Tulcan Chindoy Yuliana", descripcion: "PROMOTOR", celular: "3227175414" },
  { nombre: "Tulcan Chindoy Yuliana", descripcion: "PROMOTOR", celular: "3142915641" },
  { nombre: "Diaz Alvarado Maria Floralba", descripcion: "PSICOLOGA", celular: "3157772526" },
  { nombre: "Diaz Alvarado Maria Floralba", descripcion: "PSICOLOGA", celular: "3209681500" },
  { nombre: "Ceron Juagibioy Jose", descripcion: "SABEDOR", celular: "3203696287" },
  { nombre: "Jamioy Jacanamejoy Paula Mayerly", descripcion: "PROMOTOR", celular: "3156682275" },
  { nombre: "Rosero Mutumbajoy Daniela Alexandra", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3218322103" },
  { nombre: "Rosero Mutumbajoy Daniela Alexandra", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3219929636" },
  { nombre: "Mutumbajoy Eraso Karen Maureny", descripcion: "PROMOTOR", celular: "3108852728" },
  { nombre: "Davila Buesaquillo Dora Constanza", descripcion: "PSICOLOGA", celular: "3117586154" },
  { nombre: "Davila Buesaquillo Dora Constanza", descripcion: "PSICOLOGA", celular: "3212304601" },
  { nombre: "Oviedo Zamora Ayde Luceli", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 SIBUNDOY", celular: "3122456662" },
  { nombre: "Oviedo Zamora Ayde Luceli", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 SIBUNDOY", celular: "3217843129" },
  { nombre: "Diaz Diaz Ernestina Isabel", descripcion: "PROMOTOR", celular: "3186946209" },
  { nombre: "Diaz Diaz Ernestina Isabel", descripcion: "PROMOTOR", celular: "3118648814" },
  { nombre: "Cuatindioy Tandioy Rosa Irene", descripcion: "PROMOTOR", celular: "3228721916" },
  { nombre: "Cuatindioy Tandioy Rosa Irene", descripcion: "PROMOTOR", celular: "3167116977" },
  { nombre: "Oviedo Zamora Huveidi Yuliana", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3202092745" },
  { nombre: "Sigindioy Jamioy Maria Alicia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3188195462" },
  { nombre: "Burgos Ceron Yenifer Alejandra", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3104325429" },
  { nombre: "Burgos Ceron Yenifer Alejandra", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3114005987" },
  { nombre: "Lopez Guerrero Ninsa Lucia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3125516251" },
  { nombre: "Tisoy Tandioy Sandra Gabriela", descripcion: "", celular: "3135469124" },
  { nombre: "Pilar Toro Muriel", descripcion: "ODONTOLOGIA", celular: "3150277799" },
  { nombre: "Chingal Figueroa Isabel Cristina", descripcion: "AUX ODONTOLOGIA", celular: "3146094830" },
  { nombre: "Enriquez Erazo David Sebsatian", descripcion: "", celular: "3145843422" },
  { nombre: "Mosquera Taquez Margarita Rosa", descripcion: "", celular: "3226656880" },
  { nombre: "Rodriguez Rosero Aura Monica", descripcion: "", celular: "3107144353" },
  { nombre: "Rodriguez Rosero Aura Monica", descripcion: "", celular: "3147528457" },
  { nombre: "Mera Jimenez Jani Lindey", descripcion: "", celular: "3204202747" },
  { nombre: "Jimenez Torres David Mauricio", descripcion: "Medico General", celular: "3218011067" },
  { nombre: "Chaves Chapid Marjorie Heraldine", descripcion: "Aux. Enfermeria", celular: "3234633051" },
  { nombre: "Suarez Oneida Del Carmen", descripcion: "Sabedora", celular: "3208232768" },
  { nombre: "Rivera Montenegro Tatiana Yurani", descripcion: "ENFERMERA PROFESIONAL", celular: "3169406307" },
  { nombre: "Barrera Cortez Sandra Milena", descripcion: "AUXILIAR DE ENFERMERÍA", celular: "3122510738" },
  { nombre: "Ramos Rosero Deicy Ximena", descripcion: "AUXILIAR ENFERMERIA EBS 5 SIBUNDOY", celular: "3143572101" },
  { nombre: "Mutumbajoy Tandio Deisy Julieth", descripcion: "AUXILIAR DE ENFERMERIA EB 3 COLON", celular: "3205588047" },
  { nombre: "Cuaran Morales Carmen Vivivana", descripcion: "Promotor", celular: "3202032300" },
  { nombre: "Salazar H Heidy Andrea", descripcion: "ENFERMERIA", celular: "3112538404" },
  { nombre: "Lombana Fajardo Deissy Lorena", descripcion: "", celular: "3227340717" },
  { nombre: "Moreno Duarte Francy Julieth", descripcion: "", celular: "3134657697" },
  { nombre: "Moreno Duarte Francy Julieth", descripcion: "", celular: "3206742633" },
  { nombre: "Bastidas Navarro Sandra Milena", descripcion: "FACTURADORA SIBUNDOY", celular: "3133234275" },
  { nombre: "Bastidas Navarro Sandra Milena", descripcion: "FACTURADORA SIBUNDOY", celular: "3116275545" },
  { nombre: "Riobamba Benavides Sonia Andrea", descripcion: "AUX CARTERA", celular: "3209030554" },
  { nombre: "Gomez Rivera Maria Fernanda", descripcion: "COORDINADORA DE TBC  HANSEN Y CANCER", celular: "3229553251" },
  { nombre: "Madronero Munoz Johana Carolina", descripcion: "", celular: "3234810383" },
  { nombre: "Tovar Coral Cristiam Jair", descripcion: "", celular: "3112117680" },
  { nombre: "Tisoy Chasoy Lila America", descripcion: "", celular: "3104512302" },
  { nombre: "Chindoy Tisoy Luisa Fernanda", descripcion: "ODONTOLOGA EXTRAMURAL", celular: "3203521716" },
  { nombre: "Paola Surley Aguillon Agreda", descripcion: "", celular: "3114474225" },
  { nombre: "Moran Granda Vanessa Elizabeth", descripcion: "", celular: "3158669261" },
  { nombre: "Moran Granda Vanessa Elizabeth", descripcion: "", celular: "3187777834" },
  { nombre: "Vanegas Jamioy Adela Yeraldin", descripcion: "", celular: "3178259451" },
  { nombre: "Estrada Castillo Marlin Andrea", descripcion: "", celular: "3135836487" },
  { nombre: "Rivera Jaramillo Maria Isabella", descripcion: "", celular: "321948867" },
  { nombre: "Quitiaquez Zambrano Yadi Lorena", descripcion: "AUX. ENFERMERIA", celular: "3193727834" },
  { nombre: "Ramos Mejia Maribel", descripcion: "MEDICO EBS 2 COLON", celular: "3107666321" },
  { nombre: "Yaneth Quintero Guerrero", descripcion: "SERVICIOS HOSPITALARIOS", celular: "3127796474" },
  { nombre: "Yaneth Quintero Guerrero", descripcion: "SERVICIOS HOSPITALARIOS", celular: "3146021432" },
  { nombre: "Yigda Migdalia", descripcion: "AUX FACT", celular: "3207263660" },
  { nombre: "Admisiones Hospitalizacion", descripcion: "ADMISIONES HOSPITALIZACION", celular: "3152327144" },
  { nombre: "Benavides Agreda Wilson Norberto", descripcion: "AUX. ENFERMERIA EBS 3 SAN FRANCISCO", celular: "3143063437" },
  { nombre: "Benavides Agreda Wilson Norberto", descripcion: "AUX. ENFERMERIA EBS 3 SAN FRANCISCO", celular: "3107515811" },
  { nombre: "Janeth Melo", descripcion: "AUX. ENFERMERIA", celular: "3223711032" },
  { nombre: "Martha Arteaga", descripcion: "AUX. ENFERMERIA", celular: "3122442118" },
  { nombre: "Martha Arteaga", descripcion: "AUX. ENFERMERIA", celular: "3113067581" },
  { nombre: "Jurado Jacanamijoy Dorys Alexandra", descripcion: "EBS 1 SANTIAGO AUXILIAR", celular: "3137442665" },
  { nombre: "Ayda Jacanamenjoy", descripcion: "AUX. ENFERMERIA", celular: "3172879577" },
  { nombre: "Maria Amparo Orjuela", descripcion: "JEFE", celular: "3122963663" },
  { nombre: "Jose Antonio Guerra", descripcion: "AUX. ENFERMERIA", celular: "3229591666" },
  { nombre: "Maria Elizabeth Guevara", descripcion: "AUX. ENFERMERIA", celular: "3133778609" },
  { nombre: "Marcela Solarte", descripcion: "INSTRUMENTADORA", celular: "3137958949" },
  { nombre: "Chindoy Jacanamijoy Yanet Del Socor", descripcion: "AUX. ENFERMERIA", celular: "3108459468" },
  { nombre: "Rojas Chavez Vivian Iliana", descripcion: "ODONTOLOGA", celular: "3152914913" },
  { nombre: "Rojas Chavez Vivian Iliana", descripcion: "ODONTOLOGA", celular: "3168239500" },
  { nombre: "Dabeiba Quintero", descripcion: "AUX. ENFERMERIA", celular: "3209099030" },
  { nombre: "Socorro Cuaran", descripcion: "AUX. ENFERMERIA", celular: "3206178185" },
  { nombre: "Rosero Arango Anita Karolina", descripcion: "AUX  ENFERMERIA", celular: "315440392" },
  { nombre: "Rosero Arango Anita Karolina", descripcion: "AUX  ENFERMERIA", celular: "3122466189" },
  { nombre: "Vanegas Morales Yina Vanesa", descripcion: "AUX ENFERMERIA EBS 3 SIBUNDOY", celular: "3225200043" },
  { nombre: "Vanegas Morales Yina Vanesa", descripcion: "AUX ENFERMERIA EBS 3 SIBUNDOY", celular: "3104063721" },
  { nombre: "Betty Ruiz", descripcion: "TRABAJO SOCIAL", celular: "3153655609" },
  { nombre: "Anamaria Agreda", descripcion: "AUX. ENFERMERIA", celular: "3233326738" },
  { nombre: "Anamaria Agreda", descripcion: "AUX. ENFERMERIA", celular: "3143403385" },
  { nombre: "Jamioy Jamioy Clara", descripcion: "AUX. ENFERMERIA SAN FRANCISCO EBS 1", celular: "3123425677" },
  { nombre: "Martinez Vallejo Luis Antonio", descripcion: "ADMISIONES", celular: "3205743303" },
  { nombre: "Rosero Burbano Carlos Eduardo", descripcion: "HISTORIAS CLINICAS", celular: "3104269474" },
  { nombre: "Mujanajinsoy Quinchoa Erick Dimagnu", descripcion: "FACTURADOR EBS COLON Y SANTIAGO", celular: "3127214705" },
  { nombre: "Jaimes Zambrano Maria Flor", descripcion: "PSICOLOGA", celular: "3177959329" },
  { nombre: "Adriana Gonzalez", descripcion: "SISTEMAS", celular: "3217465241" },
  { nombre: "Riobamba Erazo Marisel Eloiza", descripcion: "FACTURACION", celular: "3136689943" },
  { nombre: "Martinez Benavides Juanita Magnolia", descripcion: "MEDICO EBS 2 SIBUNDOY", celular: "3172118073" },
  { nombre: "Martinez Benavides Juanita Magnolia", descripcion: "MEDICO EBS 2 SIBUNDOY", celular: "3118926885" },
  { nombre: "Mavisoy Mojomboy Ana Irene", descripcion: "REGENTE", celular: "3209133654" },
  { nombre: "Aylen Polo", descripcion: "ENFERMERA JEFE", celular: "3118459475" },
  { nombre: "Claudia Obando", descripcion: "ENF. JEFE", celular: "3144463634" },
  { nombre: "Claudia Obando", descripcion: "ENF. JEFE", celular: "3228724085" },
  { nombre: "Jesus Alberto Lopez Martinez", descripcion: "TESORERO", celular: "3123067248" },
  { nombre: "Isabel Cristina Masmuta", descripcion: "PWD", celular: "3202342382" },
  { nombre: "Yepez Narvaez Oscar Favian", descripcion: "AUX. FACTURACION", celular: "3127654512" },
  { nombre: "Yepez Narvaez Oscar Favian", descripcion: "AUX. FACTURACION", celular: "3207450477" },
  { nombre: "Carla Yamile Burgos Benavides", descripcion: "TRABAJADORA SOCIAL", celular: "3104376564" },
  { nombre: "Tisoy Jansasoy Carmen Rosa", descripcion: "AUX. ENFERMERIA", celular: "3000000000" },
  { nombre: "Quiston Guayapatoy Diego Andres", descripcion: "AUX, ENFERMERIA", celular: "3158887274" },
  { nombre: "Quiston Guayapatoy Diego Andres", descripcion: "AUX, ENFERMERIA", celular: "3208348659" },
  { nombre: "Zamora Legarda Sonnia Rocio", descripcion: "ODONTOLOGIA", celular: "3116420428" },
  { nombre: "Mejia Muñoz Anabelly", descripcion: "MEDICO EBS 2 COLON", celular: "3164948461" },
  { nombre: "Riobamba Arciniegas Martha Cecilia", descripcion: "CARTERA", celular: "3152523498" },
  { nombre: "Rosero Portilla Oscar Dario", descripcion: "MEDICO GENERAL EBS 5 SIBUNDOY", celular: "3122855166" },
  { nombre: "Ortega Gonzalez Daniella Fernanda", descripcion: "MEDICO", celular: "313 790678" },
  { nombre: "Ortega Miticanoy Jose Azael", descripcion: "", celular: "3147917481" },
  { nombre: "Zorayda Del Carmen Ramos Mejia", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3148078457" },
  { nombre: "Karen Daniela Lasso Madroñero", descripcion: "AUXILIAR ENFERMERIA", celular: "3132066641" },
  { nombre: "Ana Karina Jurado Arevalo", descripcion: "COORD. FACT", celular: "3223113914" },
  { nombre: "Nasly Lorena Erazo Jimenez", descripcion: "AUX. ENFERMERIA HOSPITALIZACION", celular: "3235197552" },
  { nombre: "Nasly Lorena Erazo Jimenez", descripcion: "AUX. ENFERMERIA HOSPITALIZACION", celular: "3104090090" },
  { nombre: "Arevalo Maria", descripcion: "AUX ODONTOLOGIA", celular: "3146441067" },
  { nombre: "Arevalo Maria", descripcion: "AUX ODONTOLOGIA", celular: "3136406228" },
  { nombre: "Maria Rita Matabajoy", descripcion: "AUX ENFERMERIA", celular: "3127748795" },
  { nombre: "Cordoba Miriam Patricia", descripcion: "AUX. ENFERMERIA", celular: "3125197311" },
  { nombre: "Ortiz Zambrano Rocio Estefany", descripcion: "GESTORA COMUNITARIA EBS 2 SAN FRANCISCO", celular: "3118085691" },
  { nombre: "Pejendino Vallejo Dima Del Rosario", descripcion: "AUXILIAR ENFERMERIA  EBS 2 COLON", celular: "3215876261" },
  { nombre: "Patricia Jamioy", descripcion: "TRABAJADORA SOCIAL", celular: "3209254166" },
  { nombre: "Arciniegas Chamorro Gladys Marcela", descripcion: "AUX ENFERMERIA", celular: "3152752525" },
  { nombre: "Nhora Mera", descripcion: "AUX CUENTAS", celular: "3188801557" },
  { nombre: "Claudia Carlosama", descripcion: "AUXILIAR ENFERMERIA EQUIPOS BASICOS", celular: "3233200236" },
  { nombre: "Claudia Carlosama", descripcion: "AUXILIAR ENFERMERIA EQUIPOS BASICOS", celular: "3212426232" },
  { nombre: "Daryani Maya De La Cruz", descripcion: "AUX. ENFERMERIA", celular: "3143422422" },
  { nombre: "Eddy Libardo Valencia", descripcion: "AUX. ENFERMERIA", celular: "3127221594" },
  { nombre: "Eddy Libardo Valencia", descripcion: "AUX. ENFERMERIA", celular: "3226352334" },
  { nombre: "Alba Livia Cahalial", descripcion: "AUX. ENFERMERIA", celular: "3152384276" },
  { nombre: "Alba Ines Yaqueno", descripcion: "AUX. ENFERMERIA", celular: "3107595471" },
  { nombre: "Maigual Quinchoa Maria Angelita", descripcion: "PSICÓLOGO EB COLON 3", celular: "3134042260" },
  { nombre: "Ermes Tulio Carlosama", descripcion: "AUX. ENFERMERIA", celular: "3138688515" },
  { nombre: "Ermes Tulio Carlosama", descripcion: "AUX. ENFERMERIA", celular: "3216348257" },
  { nombre: "Angie Liseth Pinchao", descripcion: "AUX. ENFERMERIA", celular: "3188438892" },
  { nombre: "Carmen Legarda", descripcion: "AUX. ENFERMERIA", celular: "3122629866" },
  { nombre: "Carmen Legarda", descripcion: "AUX. ENFERMERIA", celular: "3127760639" },
  { nombre: "Sonia Isabel Enriquez", descripcion: "AUX. ENFERMERIA", celular: "3116371501" },
  { nombre: "Solarte Jojoa Marcela", descripcion: "AUX.ENFERMERIA EBS 1 SANTIAGO", celular: "3208346273" },
  { nombre: "Yaneth Josefina Arevalo", descripcion: "TRABAJADORA SOCIAL", celular: "3219776565" },
  { nombre: "España Rosero Brenda Sthepany", descripcion: "AUXILIAR DE ENFERMERIA EBS 4", celular: "3142663447" },
  { nombre: "Yannet Chasparisan", descripcion: "AUX. ENFERMERIA", celular: "3209138419" },
  { nombre: "Realpe Agreda Yudy Carolina", descripcion: "GESTOR COMUNITARIO EBS 1 SIBUNDOY", celular: "3117876081" },
  { nombre: "Realpe Agreda Yudy Carolina", descripcion: "GESTOR COMUNITARIO EBS 1 SIBUNDOY", celular: "3207192798" },
  { nombre: "Ortiz Zambrano Nelsy Katherine", descripcion: "", celular: "3104449245" },
  { nombre: "Ortiz Zambrano Nelsy Katherine", descripcion: "", celular: "3232537664" },
  { nombre: "Maria Alejandra Rosero", descripcion: "AUX CUENTAS", celular: "3105383113" },
  { nombre: "Burbano Josa Janeth Karolina", descripcion: "FACT", celular: "3209982435" },
  { nombre: "Burbano Josa Janeth Karolina", descripcion: "FACT", celular: "3176251776" },
  { nombre: "Leidy Natali Castro Arteaga", descripcion: "FACTURACION CONSULTA EXTERNA", celular: "3215315405" },
  { nombre: "Ortiz Villarreal Laura Estefania", descripcion: "EBS 3 SIBUNDOY AUXILIAR DE NFERMERIA", celular: "3117020233" },
  { nombre: "Lia Carolina Muriel Lopez", descripcion: "AUX ENFERMERIA", celular: "3225296628" },
  { nombre: "Delgado Renza Sandra Marcela", descripcion: "ODONTOLOGA", celular: "3113825844" },
  { nombre: "Vivias Alvarado Maritza Andrea", descripcion: "REGENTE", celular: "3155735163" },
  { nombre: "Caicedo Molina Nidia Lissette", descripcion: "AUX. ENFERMERIA EB 1 COLON", celular: "3204791136" },
  { nombre: "Caicedo Molina Nidia Lissette", descripcion: "AUX. ENFERMERIA EB 1 COLON", celular: "3204104016" },
  { nombre: "Campaña Rosero Maria Camila", descripcion: "MEDICO", celular: "3046598997" },
  { nombre: "Campaña Rosero Maria Camila", descripcion: "MEDICO", celular: "3122387067" },
  { nombre: "Muñoz Lizcano Karen Vanessa", descripcion: "AUX. ENFERMERIA", celular: "3116530913" },
  { nombre: "Muñoz Lizcano Karen Vanessa", descripcion: "AUX. ENFERMERIA", celular: "3104282102" },
  { nombre: "Martinez Jimenez Nazly Ermita", descripcion: "AUX ENFERMERIA", celular: "3228687767" },
  { nombre: "Martinez Jimenez Nazly Ermita", descripcion: "AUX ENFERMERIA", celular: "3104938311" },
  { nombre: "Farmacia Unidad Mental", descripcion: "FARMACIA", celular: "3157713474" },
  { nombre: "Valencia Enriquez Lizeth Carolina", descripcion: "AUX. ENFERMERIA EBS 2 SAN FRANCISCO", celular: "3148739789" },
  { nombre: "Valencia Enriquez Lizeth Carolina", descripcion: "AUX. ENFERMERIA EBS 2 SAN FRANCISCO", celular: "3134208220" },
  { nombre: "Mady Saney Bacca Pejendino", descripcion: "", celular: "3172573554" },
  { nombre: "Mallama Botina Sandra Milena", descripcion: "AUX. FACTURACION", celular: "3115930300" },
  { nombre: "Socorro Cordoba", descripcion: "CITAS MEDICAS ADMISIONES", celular: "3206739596" },
  { nombre: "Socorro Cordoba", descripcion: "CITAS MEDICAS ADMISIONES", celular: "3206758374" },
  { nombre: "Yela Vallejo Diana Carolina", descripcion: "RESOLUCION 202", celular: "3137560658" },
  { nombre: "Yela Vallejo Diana Carolina", descripcion: "RESOLUCION 202", celular: "3127312409" },
  { nombre: "Andrade Ortega Yeny Marcela", descripcion: "AUX. FACTURACION", celular: "3127938718" },
  { nombre: "Andrade Ortega Yeny Marcela", descripcion: "AUX. FACTURACION", celular: "3116437496" },
  { nombre: "Robles Guaquez Jennifer Katerin", descripcion: "AUXILIAR DE ENFERMERIA EBS 1 SAN FRANCISCO", celular: "3166975192" },
  { nombre: "Cabrera Riobamba Erika Milena", descripcion: "GLOSAS APOYO", celular: "3216214089" },
  { nombre: "Cabrera Riobamba Erika Milena", descripcion: "GLOSAS APOYO", celular: "3143478102" },
  { nombre: "Yepez Narvaez Maria Cristina", descripcion: "FACTURADORA EBS", celular: "3143210959" },
  { nombre: "Diaz Muñoz Maria Emilse", descripcion: "GESTOR COMUNITARIO EBS 3 SIBUNDOY", celular: "3103450759" },
  { nombre: "Magola Bastidas Benavides", descripcion: "AUXILIAR ODONT CITAS MEDICAS", celular: "3167663453" },
  { nombre: "Quiston Juagibioy Angela Sofia", descripcion: "Auxiliar de enfermeira ebs2 Sibundoy", celular: "3219737669" },
  { nombre: "Yenni Liliana Obando Martinez", descripcion: "AUX. FACT", celular: "3123691304 3103559698" },
  { nombre: "Jeimy Malory Quejuan Medina", descripcion: "AUX. FACTURACION", celular: "3233243766" },
  { nombre: "Edwin Andres Chindoy Jamioy", descripcion: "AUX. ENFERMERIA", celular: "3168831835" },
  { nombre: "Genny Marlen Burbano Fierro", descripcion: "MEDICO", celular: "3147880500" },
  { nombre: "Catalina Marcela Martinez Taquez", descripcion: "REGENTE", celular: "3117429927" },
  { nombre: "Pardo Valencia Bertha Elisabeth", descripcion: "ADMISIONES", celular: "3153907165" },
  { nombre: "Pardo Valencia Bertha Elisabeth", descripcion: "ADMISIONES", celular: "3181912507" },
  { nombre: "Narvaez David Juseidy Carolina", descripcion: "CALL CENTER", celular: "3155022883" },
  { nombre: "Yandar Maria Magdalena", descripcion: "AUX, ENFERMERIA", celular: "3057629431" },
  { nombre: "Yandar Maria Magdalena", descripcion: "AUX, ENFERMERIA", celular: "3216461806" },
  { nombre: "Jojoa Muñoz Adriana Yaritza", descripcion: "AUX ENFERMERIA", celular: "3126153270" },
  { nombre: "Becerra Hernandez Camila Alexandra", descripcion: "AUX ENFERMERIA EBS 2 SAN FRANCISCO", celular: "3156546789" },
  { nombre: "Yury Camila Zamudio Zamudio", descripcion: "AUX. ENFERMERIA", celular: "3153382957" },
  { nombre: "Sandra Estefania Juagibioy Mancheno", descripcion: "AUX. ENFERMERIA", celular: "3202885327" },
  { nombre: "Sandra Estefania Juagibioy Mancheno", descripcion: "AUX. ENFERMERIA", celular: "3223226174" },
  { nombre: "Castro Chaleal Yesenia Deyanira", descripcion: "ADMISIONES", celular: "3233831287" },
  { nombre: "Luisa Fernanda Cuatindioy Jansasoy", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3123010461" },
  { nombre: "Luisa Fernanda Cuatindioy Jansasoy", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3202912371" },
  { nombre: "Tulia Yolima Patiño Gamboa", descripcion: "AUXILIAR ENFERMERIA", celular: "3122324340" },
  { nombre: "Tulia Yolima Patiño Gamboa", descripcion: "AUXILIAR ENFERMERIA", celular: "3232466909" },
  { nombre: "Cuatindioy Jacanamijoy Carmen Marin", descripcion: "GESTOR COMUNITARIO EBS 1 SANTIAGO", celular: "3145320750" },
  { nombre: "Cuatindioy Jacanamijoy Carmen Marin", descripcion: "GESTOR COMUNITARIO EBS 1 SANTIAGO", celular: "3157458062" },
  { nombre: "Ammy Katalina Gonzalez Guerrero", descripcion: "TRABAJO SOCIAL", celular: "3117382062" },
  { nombre: "Ana Lucia Jansasoy Chasoy", descripcion: "FACTURACION", celular: "3209437875" },
  { nombre: "Angela Amparo Delgado Enriquez", descripcion: "AUX ENFERMERIA", celular: "3175603094" },
  { nombre: "Angela Amparo Delgado Enriquez", descripcion: "AUX ENFERMERIA", celular: "3217676395" },
  { nombre: "Bayron Heriberto Ponce Vallejo", descripcion: "AUDITOR CALIDAD", celular: "3128274287" },
  { nombre: "Elina Del Carmen Salcedo Cusi", descripcion: "AUX ENFERMERIA", celular: "3111111111" },
  { nombre: "Rosero Maya Jenny Alejandra", descripcion: "", celular: "3146242716" },
  { nombre: "Maria Del Carmen Chamorro Zambrano", descripcion: "AUXILIAR ENFERMERIA", celular: "3123923314" },
  { nombre: "Zambrano Pulsara Rubiela Virley", descripcion: "AUXILIAR ENFERMERIA", celular: "3176846078" },
  { nombre: "Murcia Castillo Paula Alejandra", descripcion: "JEFE ENFERMERIA EBS 2 COLON", celular: "3212447570" },
  { nombre: "Christy Sanchez", descripcion: "REFERENCIA Y CONTRARREFERENCIA", celular: "3236489822" },
  { nombre: "Andrea Zambrano", descripcion: "REFERENCIA Y CONTRARREFERENCIA", celular: "3186777865" },
  { nombre: "Narvaez Rios Mario David", descripcion: "FACTURACION", celular: "3217302471" },
  { nombre: "Mujanajinsoy Quenguan Luz Arelys", descripcion: "PWD", celular: "3134378454" },
  { nombre: "Mujanajinsoy Janamejoy Jimy Fernand", descripcion: "FACTURACION", celular: "3133489272" },
  { nombre: "Puerres Quenan Maria Jose", descripcion: "FACTURACION", celular: "3183179015" },
  { nombre: "Maria Ortega", descripcion: "ADMISIONES", celular: "3117709824" },
  { nombre: "Clementina Mojomboy", descripcion: "REGENTE FARMACIA", celular: "3103823114" },
  { nombre: "Camilo Meza", descripcion: "FACTURACION", celular: "3128743770" },
  { nombre: "Angela Cabrera", descripcion: "CONTABILIDAD", celular: "3178822364" },
  { nombre: "Nesly Guerrero", descripcion: "REGENTE FARMACIA", celular: "3134951457" },
  { nombre: "Chapal Acosta Mayerli Tatiana", descripcion: "", celular: "3165010774" },
  { nombre: "Chapal Acosta Mayerli Tatiana", descripcion: "", celular: "3178134829" },
  { nombre: "Cordoba Muñoz Jose Danilo", descripcion: "", celular: "3137836635" },
  { nombre: "Lopez Muñoz Angie Carmenza", descripcion: "", celular: "3138626400" },
  { nombre: "Ortiz Benitez Maria De Los Angeles", descripcion: "", celular: "3154830680" },
  { nombre: "Alison Yesenia Jimenez Valencia", descripcion: "FACTURADORA SIBUNDOY", celular: "3227670805" },
  { nombre: "Nelly Arley Burgos Burgos", descripcion: "", celular: "3102016850" },
  { nombre: "Nelly Arley Burgos Burgos", descripcion: "", celular: "3108301164" },
  { nombre: "Natalia Yaneth Rosero", descripcion: "REGENTE DE FARMACIA", celular: "3152539373" },
  { nombre: "Natalia Yaneth Rosero", descripcion: "REGENTE DE FARMACIA", celular: "3102721440" },
  { nombre: "Botina Jojoa Erika Catherine", descripcion: "PSICOLOGA EBS 3 SIBUNDOY", celular: "3168280027" },
  { nombre: "Alexandra Polo", descripcion: "ESTADISTICA", celular: "3134769910" },
  { nombre: "Jose Victor Perez", descripcion: "MEDICO", celular: "3128266816" },
  { nombre: "Arciniegas Chasoy Luz Dary", descripcion: "AUXILIAR DE ENFERMERIA VACUNACION", celular: "3216344825" },
  { nombre: "Imbajoa Ramos Yina Paola", descripcion: "AUXILIAR DE ENFERMERIA", celular: "3104598108" },
  { nombre: "Burgos Ibarra Dannia Yamile", descripcion: "", celular: "3222621320" },
  { nombre: "Bravo Delgado Fanny Elda", descripcion: "", celular: "3128668898" },
  { nombre: "Bravo Delgado Fanny Elda", descripcion: "", celular: "3148341835" },
  { nombre: "Ana Aracely López Martinez", descripcion: "PSICOLOG@", celular: "3117961171" },
  { nombre: "Marquines De La Cruz Luisa Fernanda", descripcion: "", celular: "3105918672" },
  { nombre: "Marquines De La Cruz Luisa Fernanda", descripcion: "", celular: "3027650819" },
  { nombre: "Cuaspa Imbacuan Karen Yamileth", descripcion: "AUXILIAR DE ENFERMERIA EBS 5 SIBUNDOY", celular: "3134272520" },
  { nombre: "Cuaspa Imbacuan Karen Yamileth", descripcion: "AUXILIAR DE ENFERMERIA EBS 5 SIBUNDOY", celular: "3148736053" },
  { nombre: "Castro Fuertes Andrea Milena", descripcion: "", celular: "3147453115" },
  { nombre: "Cabrera Salazar Maria Isabel", descripcion: "JEFE DE ENFERMERIA EBS 3 SANTIAGO", celular: "3207203212" },
  { nombre: "Montero Rivera Mayra Yaritza", descripcion: "JEFE DE ENFERMERIA EBS 1 SAN FRANCISCO", celular: "3217855928" },
  { nombre: "Vivian Carolina Tovar Guerrero", descripcion: "OTRO", celular: "3025091142" },
  { nombre: "Ascuntar Yandar Jairo Andres", descripcion: "", celular: "3116412081" },
  { nombre: "Ascuntar Yandar Jairo Andres", descripcion: "", celular: "3123053280" },
  { nombre: "Yessica Milena Zamudio Montero", descripcion: "PSICOLOG@", celular: "3124591602" },
  { nombre: "Diego Alejandro Cabrera Zamudio", descripcion: "AUX ENFERMERIA UNIDAD SALUD MENTAL", celular: "3202011970" },
  { nombre: "Jacanamejoy Guerron Sonia Mireya", descripcion: "", celular: "3127726840" },
  { nombre: "Lopez Guevara Jenifer Xiomara", descripcion: "AUXILIAR DE ENFERMERIA EBS 5 SIBUNDOY", celular: "3217547488" },
  { nombre: "Ordoñez Herrera Santiago", descripcion: "APOYO ADMINISTRATIVO DE COLON HOSPITAL PIO XII", celular: "3202127176" },
  { nombre: "Cabrera Salazar Leidy Yelisa", descripcion: "APOYO TÉCNICO A LA  COORDINACIÓN SALUD ORAL", celular: "3205015902" },
  { nombre: "Cabrera Salazar Leidy Yelisa", descripcion: "APOYO TÉCNICO A LA  COORDINACIÓN SALUD ORAL", celular: "3117200862" },
  { nombre: "Cuaran Palacios Jorge Luis", descripcion: "PSICOLOGO EBS 3 SANTIAGO", celular: "3222232445" },
  { nombre: "Jajoy Jajoy Segundo Basilio", descripcion: "GESTOR COMUNITARIO EBS 3 COLON", celular: "3114160838" },
  { nombre: "Jajoy Jajoy Segundo Basilio", descripcion: "GESTOR COMUNITARIO EBS 3 COLON", celular: "3116592435" },
  { nombre: "Acosta Salazar Sara Jicela", descripcion: "", celular: "3209635561" },
  { nombre: "Acosta Salazar Sara Jicela", descripcion: "", celular: "3108201304" },
  { nombre: "Mutumbajoy Tandioy Luz Adriana", descripcion: "FACTURADORA URGENCIAS", celular: "3217433688" },
  { nombre: "Recalde Mutumbajoy Luis Carlos", descripcion: "GESTOR COMUNITARIO EBS 1 SAN FRANCISCO", celular: "3126837496" },
  { nombre: "Chamorro Rueda Deninson Alexander", descripcion: "AuxSistemas", celular: "3136690977" },
  { nombre: "Chindoy Chindoy Daniel Esteban", descripcion: "JEFE DE ENFERMERIA USM", celular: "3138258955" },
  { nombre: "Chatez Moncayo Deysy Viviana", descripcion: "GESTORA COMUNITARIA EBS 3 SAN FRANCISCO", celular: "3214344856" },
  { nombre: "Timaran Coral Daniela Fernanda", descripcion: "AUXILIAR DE ENFERMERIA SANTIAGO", celular: "3216662754" },
  { nombre: "Quinchoa Mavisoy Jhon Carlos", descripcion: "", celular: "3208154127" },
  { nombre: "Dejoy Tandioy Maria Jesus", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 COLON", celular: "3177550743" },
  { nombre: "Arteaga Duarte Franklin Stiven", descripcion: "GESTOR COMUNITARIO EBS 2 COLON", celular: "3106848258" },
  { nombre: "Gomez Benavides Claudia Gisela", descripcion: "JEFE DE ENFERMEIRA EBS 4 SIBUNDOY", celular: "3104705069" },
  { nombre: "Chindoy Jamioy Angela Johana", descripcion: "GESTOR COMUNITARIO EBS 2 SIBUNDOY", celular: "3209674251" },
  { nombre: "Restrepo Maya Luisa Valentina", descripcion: "GLOSAS", celular: "3226862970" },
  { nombre: "Eraso Cuayal Diego Armando", descripcion: "", celular: "3158937550" },
  { nombre: "Basante Tisoy Juan Camilo", descripcion: "APOYO ADMINISTRATIVO DE COLON HOSPITAL PIO XII", celular: "3102972174" },
  { nombre: "Mejia Linero Daira Lorena", descripcion: "PSICOLOGA EBS 1 SAN FRANCISCO", celular: "3154765418" },
  { nombre: "Noguera España Andrea Fernanda", descripcion: "AUXILIAR DE ENFERMERIA EBS 3 SIBUNDOY", celular: "3209391124" },
  { nombre: "Morales Jojoa Maria Cristina", descripcion: "PSICOLOGA EBS 1 SIBUNDOY", celular: "3136281103" },
  { nombre: "Julian España", descripcion: "PROFESIONAL DESARROLLO DE SOFTWARE", celular: "3174503604" },
];

// ─── Preguntas base (todos los perfiles) ───
const PREGUNTAS_BASE = [
  "¿Cuál es tu cargo y en qué área trabajas?",
  "¿Qué tareas haces con mayor frecuencia en tu turno?",
  "¿Qué información necesitas consultar o registrar todos los días?",
  "¿Qué herramientas usas actualmente? (sistemas institucionales, formatos en papel, planillas Excel, etc.)",
  "¿Qué parte de tu trabajo consume más tiempo o te genera más fricción?",
  "¿Hay información que necesitas y que no tienes fácil acceso?",
  "¿Recibes notificaciones o alertas de algo? ¿Cómo te enteras de cosas urgentes?",
  "¿Trabajas con turnos rotativos? ¿Cómo haces el empalme o relevo de turno?",
];

// ─── Preguntas por perfil ───
const BLOQUES = {
  enfermeria: {
    label: "Enfermería / Toma de signos vitales",
    keywords: [
      "enfermeria", "enfermería", "enf.", "enf ", "aux enfermeria", "aux. enfermeria",
      "auxiliar de enfermeria", "auxiliar enfermeria", "auxiliar de enfermería",
      "aux, enfermeria", "auxenfermeria", "aux.enfermeria", "aux enfermeria",
      "hospitalizacion", "hospitalizacion y urgencias", "preconsulta",
      "jefe enfermeria", "jefe de enfermeria", "jefe enfermera", "jefe enferemria",
      "jefe de enfermeira", "enfermera jefe", "enfermero jefe", "enfermera profesional",
      "enfermero profesional", "enfermeria", "enf. jefe", "efe",
      "demanda inducida", "vacunacion", "cronicos",
    ],
    preguntas: [
      "¿En qué momento del proceso tomas signos vitales? (¿antes de consulta, en urgencias, hospitalización?)",
      "¿Cómo registras los datos hoy? (papel, sistema, tablet)",
      "¿El equipo que usas (tensiómetro, oxímetro, etc.) tiene conexión a algún sistema o el registro es manual?",
      "¿Quién necesita ver esos datos después? ¿El médico los consulta antes de entrar al paciente?",
      "¿Con qué frecuencia tomas signos en hospitalización? ¿Hay un protocolo definido?",
    ],
  },
  medico: {
    label: "Médicos / Consulta externa",
    keywords: [
      "medico", "médico", "medic@", "medica", "medica general",
      "ginecologa", "pediatra", "anestesiologo", "infectologo", "internista",
      "psiquiatra", "medioco radiologa", "medico cirujano", "cirujano",
      "instrumentadora",
    ],
    preguntas: [
      "¿Antes de ver al paciente, qué información necesitas tener lista?",
      "¿Consultas historia clínica? ¿En qué sistema?",
      "¿Generas órdenes médicas o fórmulas durante la consulta? ¿Cómo?",
      "¿Hay procesos que haces fuera del sistema principal? (en papel o Excel)",
    ],
  },
  administracion: {
    label: "Administración / RRHH",
    keywords: [
      "administracion", "rrhh", "recursos humanos", "servicios hospitalarios",
      "resolucion 202", "subgerente", "apoyo administrativo", "seguridad del paciente",
      "estadistica", "historias clinicas", "call center", "sistemas", "auxsistemas",
      "soportesaludips", "jefe pym", "jefe", "coordinadora de tbc",
      "salud publica", "sivigila", "sabedor", "sabedora", "pwd", "asesor",
    ],
    preguntas: [
      "¿Qué solicitudes recibes con más frecuencia del personal?",
      "¿Cómo se gestionan permisos, incapacidades y turnos?",
      "¿Hay comunicados o circulares que deban llegar rápido al personal? ¿Cómo se distribuyen hoy?",
      "¿Cómo se lleva el control de asistencia del personal? ¿Es manual o hay un sistema?",
      "¿Cómo se asignan y publican los turnos? ¿Con cuánta anticipación?",
      "¿Qué pasa cuando un empleado falta o hay un cambio de turno de urgencia? ¿Cómo lo resuelven?",
      "¿Cómo se registran y aprueban las vacaciones del personal?",
      "¿Tienes acceso rápido al organigrama o directorio del personal activo? ¿Lo necesitas con frecuencia?",
      "¿Qué tipo de reportes sobre el personal generas regularmente? (ausentismo, horas extra, novedades)",
      "¿Cómo se comunican las novedades de nómina a la parte financiera o al contador?",
      "¿Hay procesos de selección o inducción de personal que debas coordinar? ¿Cómo los manejas hoy?",
      "¿Qué información del empleado consultas con más frecuencia? (contrato, cargo, contacto, turno)",
      "¿Qué mejorarías primero si tuvieras una herramienta digital para tu área?",
    ],
  },
  financiero: {
    label: "Financiero / Facturación / Cartera",
    keywords: [
      "facturacion", "facturación", "facturadora", "factiradora", "fact", "facturador",
      "aux. facturacion", "aux facturacion", "aux. fact", "aux fact",
      "facturacion urgencias", "facturacion citas medicas", "facturacio sibundoy",
      "coord. fact", "coordinadora de facturacion",
      "glosas", "glosas apoyo", "apoyo glosas",
      "admisiones", "citas medicas admisiones", "admisiones hospitalizacion",
      "cartera", "aux cartera", "aux cuentas", "contabilidad", "tesorero",
      "referencia y contrarreferencia",
      "auditor calidad", "auditora", "resolucion 202",
      "quimica",
    ],
    preguntas: [
      "¿Con qué sistema de facturación trabajas actualmente?",
      "¿Cómo es el proceso de facturación de una atención? ¿Cuántos pasos tiene y cuáles haces tú?",
      "¿Qué información necesitas del paciente o de la atención para poder facturar?",
      "¿Cómo manejas las glosas o devoluciones de las EPS?",
      "¿Cómo se hace el cierre de caja o el corte de turno? ¿Es manual o está en un sistema?",
      "¿Qué reportes generas y con qué frecuencia? (diarios, semanales, mensuales)",
      "¿Hay información que necesites cruzar con otras áreas como cartera, tesorería o presupuesto?",
      "¿Cómo consultas el estado de cartera de una EPS o convenio?",
      "¿Hay procesos que hoy haces en Excel o papel que podrían estar en un sistema?",
      "¿Qué alertas o avisos te serían útiles? (por ejemplo: factura próxima a vencer, saldo de cartera alto)",
    ],
  },
  fisioterapia: {
    label: "Fisioterapia / Rehabilitación física",
    keywords: [
      "fisioterapeuta", "fisioterapia", "fisioterapueuta", "rehabilitacion", "rehabilitación",
      "terapeuta ocupacional", "terapia ocupacional",
    ],
    preguntas: [
      "¿Cómo recibes los pacientes que vas a atender? ¿Llegan por orden médica, por agenda o por remisión?",
      "¿Consultas la historia clínica del paciente antes de la sesión? ¿En qué sistema o formato?",
      "¿Qué información del diagnóstico médico necesitas tener disponible para planear el tratamiento?",
      "¿Cómo registras la evolución del paciente sesión a sesión? (papel, sistema, formato propio)",
      "¿Usas algún formato o escala de valoración estandarizada? (Barthel, Tinetti, MRC, etc.) ¿Lo registras en algún sistema?",
      "¿Cómo llevas el control del número de sesiones autorizadas por la EPS o convenio? ¿Quién te avisa cuando se están agotando?",
      "¿Tienes acceso al historial de sesiones anteriores de un paciente? ¿O debes empezar de cero cada vez?",
      "¿Coordinas con otros profesionales (médico, enfermería, nutrición) durante el tratamiento? ¿Cómo es esa comunicación hoy?",
      "¿Cómo se agenda la próxima sesión del paciente al terminar la atención? ¿Tú la programas o lo hace admisiones?",
      "¿Qué alertas o avisos te serían útiles durante tu jornada? (por ejemplo: paciente con contraindicación, cambio en diagnóstico, sesiones por vencer)",
      "Si tuvieras una app de apoyo, ¿qué necesitarías ver al abrir el módulo de tu área?",
    ],
  },
  odontologia: {
    label: "Odontología / Salud oral",
    keywords: [
      "odontologo", "odontologa", "odontología", "odontologia",
      "aux odontologia", "aux. odontologia", "auxiliar odont",
      "salud oral", "higienista oral",
      "apoyo tecnico a la coordinacion salud oral",
    ],
    preguntas: [
      "¿Cómo está organizada tu agenda diaria? ¿La manejas tú o alguien más la programa?",
      "¿Consultas historia clínica odontológica antes de atender al paciente? ¿En qué sistema o formato?",
      "¿Usas algún odontograma digital o lo llevas en papel? ¿Se archiva en algún sistema?",
      "¿Cómo registras los procedimientos realizados en cada cita? (códigos CUPS, descripción libre, formato propio)",
      "¿Cómo generas las órdenes de laboratorio dental (prótesis, ortodoncia, etc.)? ¿Hay un formato institucional?",
      "¿Cómo llevas el seguimiento de tratamientos que se extienden en varias citas? (endodoncia, ortodoncia, rehabilitación oral)",
      "¿Cómo controlas los insumos o materiales que usas por paciente? ¿Se registra ese consumo en algún lado?",
      "¿La EPS o convenio te exige algún documento adicional para autorizar procedimientos? ¿Cómo lo tramitas hoy?",
      "¿Coordinas con otra área cuando detectas una condición que requiere atención médica general? ¿Cómo haces esa referencia?",
      "¿Hay algún proceso administrativo ligado a tu consulta (cobro, facturación, inventario) que actualmente te quite tiempo clínico?",
      "Si tuvieras una app de apoyo, ¿qué funcionalidad considerarías más urgente para tu práctica diaria?",
    ],
  },
  psicologia: {
    label: "Psicología",
    keywords: ["psicologa", "psicologo", "psicólogo", "psicolog@", "psicologia", "psicología"],
    preguntas: [
      "¿Cómo recibes los pacientes que atiendes? ¿Llegan por remisión médica, por demanda espontánea o por programa institucional?",
      "¿Consultas historia clínica o psicológica antes de la sesión? ¿En qué sistema o soporte físico?",
      "¿Cómo registras las notas de evolución o los informes de sesión? ¿Tienes un formato institucional definido?",
      "¿Usas escalas o instrumentos de evaluación estandarizados? (PHQ-9, GAD-7, Mini-Mental, etc.) ¿Cómo registras y guardas los resultados?",
      "¿Cómo gestionas la confidencialidad de las notas clínicas? ¿Hay restricción de acceso para otros profesionales?",
      "¿Coordinas intervenciones con trabajo social, médicos o enfermería? ¿Cómo se da esa comunicación?",
      "¿Llevas seguimiento de pacientes en riesgo o con plan de seguridad activo? ¿Cómo lo documentas y a quién alertas?",
      "¿Participas en comités o espacios interdisciplinarios? ¿Cómo te convocan y cómo compartes la información del caso?",
      "¿Hay reportes o estadísticas que debas entregar periódicamente? (número de atenciones, diagnósticos, programas)",
      "¿Qué herramienta o funcionalidad de una app mejoraría más tu trabajo diario?",
    ],
  },
  fonoaudiologia: {
    label: "Fonoaudiología",
    keywords: ["fonoaudiologia", "fonoaudióloga", "fonoaudiologo", "fonoaudiologa"],
    preguntas: [
      "¿Qué tipo de pacientes atiendes con mayor frecuencia? (trastornos de lenguaje, voz, deglución, audición, comunicación)",
      "¿Cómo recibes los pacientes? ¿Llegan por orden médica, por remisión de otro profesional o por programa?",
      "¿Consultas historia clínica antes de la sesión? ¿En qué sistema o formato está disponible?",
      "¿Cómo registras las evaluaciones iniciales y las escalas que aplicas? ¿Hay un formato institucional?",
      "¿Cómo llevas el seguimiento de la evolución entre sesiones? ¿Puedes ver el historial de intervenciones anteriores fácilmente?",
      "¿Coordinas con nutrición o médicos cuando atiendes pacientes con disfagia? ¿Cómo fluye esa información hoy?",
      "¿Cómo controlas las sesiones autorizadas por la EPS o convenio para cada paciente? ¿Recibes algún aviso cuando se están agotando?",
      "¿Generas informes para entregar al médico tratante, a la familia o a la EPS? ¿Los elaboras en un formato estándar o libre?",
      "¿Hay algún proceso administrativo (agendamiento, cobro, autorización) que actualmente interrumpa o enlentezca tu trabajo clínico?",
      "Si tuvieras acceso a una app institucional, ¿qué módulo o función sería la más útil para tu área?",
    ],
  },
  farmacia: {
    label: "Farmacia / Regente",
    keywords: [
      "farmacia", "regente de farmacia", "regente farmacia", "regente",
      "tecnico auxiliar en servicios farmaceuticos",
    ],
    preguntas: [
      "¿Cómo recibes las órdenes o fórmulas médicas? ¿En papel, digital o en el sistema?",
      "¿Cómo verificas la disponibilidad de medicamentos en inventario?",
      "¿Cómo se gestiona el control de fechas de vencimiento y lotes?",
      "¿Qué información necesitas del paciente o de la EPS para dispensar un medicamento?",
      "¿Cómo reportas el consumo de medicamentos al área de compras o logística?",
      "¿Hay alertas de stock mínimo o vencimientos que debas monitorear? ¿Cómo lo haces hoy?",
      "Si tuvieras una app de apoyo, ¿qué funcionalidad considerarías más urgente?",
    ],
  },
  nutricion: {
    label: "Nutrición",
    keywords: ["nutricionista", "nutricinista"],
    preguntas: [
      "¿Cómo recibes los pacientes que atiendes? ¿Llegan por remisión, por programa o por demanda espontánea?",
      "¿Consultas la historia clínica del paciente antes de la valoración? ¿En qué sistema?",
      "¿Cómo registras la valoración nutricional y el plan alimentario? (papel, sistema, formato propio)",
      "¿Cómo haces seguimiento a los pacientes en manejo nutricional? ¿Puedes ver la evolución en consultas anteriores?",
      "¿Coordinas con médicos, enfermería u otros profesionales durante el tratamiento? ¿Cómo es esa comunicación?",
      "¿Participas en programas de salud pública o colectivos? ¿Cómo registras esas actividades?",
      "Si tuvieras una app de apoyo, ¿qué funcionalidad sería la más útil para tu área?",
    ],
  },
  trabajosocial: {
    label: "Trabajo Social",
    keywords: ["trabajo social", "trabajadora social"],
    preguntas: [
      "¿Qué tipo de situaciones o casos recibes con mayor frecuencia en tu área?",
      "¿Cómo identificas a los pacientes o familias que necesitan acompañamiento social?",
      "¿Cómo registras las intervenciones y el seguimiento de los casos? ¿Hay un formato institucional?",
      "¿Coordinas con otras áreas (médicos, psicología, enfermería) para la atención integral? ¿Cómo se hace esa articulación?",
      "¿Gestionas trámites ante EPS, ICBF u otras entidades? ¿Cómo los documentas?",
      "¿Hay alertas o situaciones urgentes que debas reportar? ¿Cómo lo haces hoy?",
      "Si tuvieras una app de apoyo, ¿qué módulo considerarías más importante para tu trabajo?",
    ],
  },
  promotor: {
    label: "Promotor / Gestor comunitario",
    keywords: ["promotor", "gestor comunitario", "gestora comunitaria", "gestro comunitario"],
    preguntas: [
      "¿Cuáles son las actividades de promoción o prevención que realizas con mayor frecuencia en la comunidad?",
      "¿Cómo registras las actividades que haces? (listas, formatos, aplicaciones)",
      "¿Con qué comunidades o zonas trabajas y cómo llegas a ellas?",
      "¿Qué información de los pacientes o familias necesitas tener disponible en campo?",
      "¿Cómo reportas las actividades realizadas al hospital o a tu coordinador?",
      "¿Tienes acceso a internet o señal cuando estás en terreno? ¿Afecta tu trabajo?",
      "¿Qué herramienta o funcionalidad de una app mejoraría más tu trabajo en campo?",
    ],
  },
  sistemas: {
    label: "Sistemas / Desarrollo de Software",
    keywords: ["desarrollo de software", "profesional desarrollo", "sistemas", "auxsistemas", "soportesaludips"],
    preguntas: [
      "¿Qué sistemas o aplicaciones tecnológicas usa actualmente el hospital en tu área?",
      "¿Qué procesos se hacen en papel o Excel que podrían digitalizarse?",
      "¿Qué integraciones o automatizaciones mejorarían más el flujo de trabajo?",
      "¿Cómo se gestiona actualmente el soporte técnico o las solicitudes de TI?",
      "¿Qué datos o reportes necesitan con más frecuencia las diferentes áreas?",
      "Si tuvieras que priorizar un módulo digital para el hospital, ¿cuál sería y por qué?",
    ],
  },
  general: {
    label: "Otro / General",
    keywords: [],
    preguntas: [],
  },
};

function detectarBloque(descripcion) {
  if (!descripcion) return 'general';
  const desc = descripcion.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [key, bloque] of Object.entries(BLOQUES)) {
    if (key === 'general') continue;
    for (const kw of bloque.keywords) {
      const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (desc.includes(kwNorm)) return key;
    }
  }
  return 'general';
}

// ─── Pantalla: Login ───
function PantallaLogin({ onLogin, error }) {
  const [celular, setCelular] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(celular.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4" style={{ paddingTop: '60px' }}>
      <div className="w-full max-w-sm">
        {/* Logo / encabezado */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">E.S.E. Hospital Pío XII</h1>
          <p className="text-blue-300 text-sm mt-1">Levantamiento de requerimientos</p>
        </div>

        {/* Tarjeta de login */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de celular
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={celular}
                onChange={e => setCelular(e.target.value)}
                placeholder="Ej: 3001234567"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md"
            >
              Ingresar
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Usa el número registrado en el hospital
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Pantalla: Cuestionario ───
function PantallaCuestionario({ empleado, bloque, onLogout }) {
  const bloqueInfo = BLOQUES[bloque];
  const todasPreguntas = [...PREGUNTAS_BASE, ...(bloqueInfo?.preguntas || [])];
  const [respuestas, setRespuestas] = useState(() => Array(todasPreguntas.length).fill(''));
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorEnvio, setErrorEnvio] = useState('');

  // Al montar, cargar respuestas previas del empleado si existen
  useEffect(() => {
    async function cargarPrevias() {
      try {
        const res = await fetch(`/api/pio12/respuestas?celular=${encodeURIComponent(empleado.celular)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.respuestas?.length) {
            setRespuestas(prev => {
              const nuevo = [...prev];
              data.respuestas.forEach(({ pregunta, respuesta }) => {
                const idx = todasPreguntas.findIndex(p => p === pregunta);
                if (idx !== -1) nuevo[idx] = respuesta;
              });
              return nuevo;
            });
            setEnviado(true);
          }
        }
      } catch {
        // si falla, empieza vacío
      } finally {
        setCargando(false);
      }
    }
    cargarPrevias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleado.celular]);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(entries => {
      setHeaderHeight(entries[0].contentRect.height);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const respondidas = respuestas.filter(r => r.trim().length > 0).length;
  const porcentaje = Math.round((respondidas / todasPreguntas.length) * 100);

  function handleRespuesta(i, valor) {
    setRespuestas(prev => {
      const nuevo = [...prev];
      nuevo[i] = valor;
      return nuevo;
    });
  }

  async function handleEnviar() {
    setEnviando(true);
    setErrorEnvio('');
    try {
      const payload = todasPreguntas.map((pregunta, i) => ({
        pregunta,
        respuesta: respuestas[i] || '',
      }));
      const res = await fetch('/api/pio12/respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: empleado.nombre,
          cargo: empleado.descripcion || '',
          celular: empleado.celular,
          bloque,
          respuestas: payload,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEnviado(true);
    } catch {
      setErrorEnvio('Hubo un problema al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header fijo debajo del navbar — ref mide su altura real */}
      <header
        ref={headerRef}
        className="bg-blue-700 text-white fixed left-0 right-0 z-10 shadow-lg"
        style={{ top: 60 }}
      >
        {/* Fila principal: nombre + botón salir */}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-blue-300 text-[10px] uppercase tracking-widest leading-none mb-0.5">
              E.S.E. Hospital Pío XII
            </p>
            <h2 className="font-bold text-base leading-snug truncate">{empleado.nombre}</h2>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 active:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Barra de progreso + texto */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-3">
          <div className="flex-1 bg-blue-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="text-green-300 text-xs font-medium whitespace-nowrap">
            {respondidas}/{todasPreguntas.length} ({porcentaje}%)
          </span>
        </div>
      </header>

      {/* paddingTop = navbar (60) + header medido en tiempo real */}
      <main
        className="max-w-2xl mx-auto px-3 pb-12 space-y-5"
        style={{ paddingTop: 60 + headerHeight + 12 }}
      >
        {/* Estado de carga inicial */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Cargando...</p>
          </div>
        )}

        {!cargando && (
          <>
            {/* Badge de perfil */}
            <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-2xl leading-none">🏥</span>
              <div className="min-w-0">
                <p className="text-blue-200 text-[10px] uppercase tracking-widest leading-none mb-0.5">Tu área</p>
                <p className="font-semibold text-sm leading-snug">{bloqueInfo?.label || 'General'}</p>
              </div>
            </div>

            {/* Bloque base */}
            <section>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                Preguntas generales
              </p>
              <div className="space-y-3">
                {PREGUNTAS_BASE.map((pregunta, i) => (
                  <PreguntaCard
                    key={i}
                    numero={i + 1}
                    pregunta={pregunta}
                    valor={respuestas[i]}
                    onChange={v => handleRespuesta(i, v)}
                  />
                ))}
              </div>
            </section>

            {/* Bloque específico */}
            {bloqueInfo?.preguntas?.length > 0 && (
              <section>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 px-1">
                  Preguntas de tu área — {bloqueInfo.label}
                </p>
                <div className="space-y-3">
                  {bloqueInfo.preguntas.map((pregunta, i) => {
                    const idx = PREGUNTAS_BASE.length + i;
                    return (
                      <PreguntaCard
                        key={idx}
                        numero={idx + 1}
                        pregunta={pregunta}
                        valor={respuestas[idx]}
                        onChange={v => handleRespuesta(idx, v)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Botón enviar / estado enviado */}
            <div className="pt-2">
              {enviado ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-8 text-center space-y-4">
                  <div className="text-5xl">✅</div>
                  <div>
                    <h4 className="font-bold text-green-800 text-xl mb-1">¡Enviado!</h4>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Tus respuestas quedaron registradas. Gracias por tu tiempo.
                    </p>
                  </div>
                  <button
                    onClick={() => setEnviado(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 rounded-2xl text-sm transition-colors shadow-md"
                  >
                    Editar mis respuestas
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {errorEnvio && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl p-3 text-center">{errorEnvio}</p>
                  )}
                  <button
                    onClick={handleEnviar}
                    disabled={enviando}
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white font-bold py-5 rounded-2xl text-base transition-colors shadow-lg"
                  >
                    {enviando ? 'Guardando...' : 'Enviar respuestas'}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    Puedes responder solo las que conozcas
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PreguntaCard({ numero, pregunta, valor, onChange }) {
  const respondida = valor.trim().length > 0;
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-colors ${respondida ? 'border-green-400' : 'border-gray-100'} p-4`}>
      <label className="block">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {numero}
          </span>
          {respondida && (
            <span className="text-green-500 text-xs font-semibold">✓ Respondida</span>
          )}
        </div>
        <p className="text-gray-800 text-sm font-medium mb-3 leading-relaxed">{pregunta}</p>
        <textarea
          value={valor}
          onChange={e => onChange(e.target.value)}
          rows={4}
          placeholder="Escribe tu respuesta aquí..."
          className="w-full border-2 border-gray-100 focus:border-blue-400 rounded-xl px-3 py-3 text-sm focus:outline-none transition-colors resize-none bg-gray-50"
        />
      </label>
    </div>
  );
}

// ─── Componente principal ───
export default function Pio12Page() {
  const [empleado, setEmpleado] = useState(null);
  const [bloque, setBloque] = useState(null);
  const [error, setError] = useState('');

  function handleLogin(celular) {
    const encontrado = EMPLEADOS.find(e => e.celular === celular);
    if (!encontrado) {
      setError('No encontramos ese número de celular. Verifica e intenta de nuevo.');
      return;
    }
    const bloqueDetectado = detectarBloque(encontrado.descripcion);
    setEmpleado(encontrado);
    setBloque(bloqueDetectado);
    setError('');
  }

  function handleLogout() {
    setEmpleado(null);
    setBloque(null);
  }

  if (!empleado) {
    return <PantallaLogin onLogin={handleLogin} error={error} />;
  }

  return <PantallaCuestionario empleado={empleado} bloque={bloque} onLogout={handleLogout} />;
}
