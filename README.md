# FitCouple 🏋️‍♂️🏋️‍♀️

Aplicación web privada diseñada exclusivamente para dos personas (esposo y esposa), orientada a guiar nuestros entrenamientos físicos en casa, registrar lo realizado y visualizar el progreso corporal de forma clara y sin fricción.

> **Importante — Alcance y Naturaleza del Proyecto:**  
> FitCouple **NO** es un producto comercial ni una plataforma SaaS. No incluye multiempresa, pasarelas de pago, suscripciones ni roles administrativos complejos. Cada decisión de diseño y desarrollo se evalúa bajo un único criterio: *¿nos ayuda a entrenar mejor o a medir nuestro progreso real?*

---

## 🎯 Objetivos Principales

1. **Uso ágil desde el celular (Mobile-First / PWA):** Botones e interfaz optimizados para registrar series, peso y repeticiones durante el entrenamiento de forma rápida y cómoda.
2. **Rutinas personalizadas e independientes:** Planes de entrenamiento adaptados a los objetivos y capacidades de cada uno.
3. **Respeto a condiciones físicas declaradas:** Filtro y adaptación estricta de ejercicios según las restricciones físicas reportadas por cada usuario (ver aviso).
4. **Optimización de equipo compartido:** Apoyo para el uso eficiente del kit de mancuernas ajustables de 20 kg disponible en casa.
5. **Seguimiento visual del progreso:** Registro de peso, medidas corporales y progresión de fuerza a lo largo del tiempo.
6. **Seguridad y privacidad local:** Datos alojados localmente en base de datos PostgreSQL mediante Docker, sin exposición pública a Internet.

---

## ⚠️ Aviso de Salud y Restricciones Físicas

Las restricciones y condiciones registradas en la aplicación corresponden a información declarada personalmente por los usuarios con el fin de excluir movimientos de riesgo o contraindicados. **Esta aplicación no realiza diagnósticos clínicos, no prescribe tratamientos médicos ni sustituye la valoración o autorización de un profesional de la salud.**

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js (App Router, React, TypeScript), Tailwind CSS, PWA (Progressive Web App).
- **Backend:** Next.js Server Actions y Route Handlers con validación mediante Zod.
- **Base de Datos & ORM:** PostgreSQL 16 Alpine en contenedor Docker aislado (`fitcouple-db-1`) en el puerto local `127.0.0.1:5438`, gestionado con Prisma ORM.
- **Aislamiento:** Red Docker exclusiva (`fitcouple_default`) y volumen persistente independiente (`fitcouple_postgres_data`), enlazado estrictamente al localhost.

---

## 🐘 Gestión de la Base de Datos Local (Docker Compose)

La infraestructura local de datos está configurada para operar de manera independiente y segura, sin interferir con otros servicios de la máquina.

### Comandos de Operación Habitual

- **Iniciar la base de datos:**
  ```powershell
  docker compose up -d
  ```
- **Consultar estado y salud del contenedor:**
  ```powershell
  docker compose ps
  ```
- **Detener la base de datos (preservando todos los datos):**
  ```powershell
  docker compose stop
  ```
- **Reanudar la base de datos:**
  ```powershell
  docker compose start
  ```
- **Reiniciar el servicio:**
  ```powershell
  docker compose restart
  ```
- **Consultar registros en tiempo real:**
  ```powershell
  docker compose logs -f db
  ```

---

## 💻 Ejecución y Acceso a la Aplicación

Para utilizar la aplicación en desarrollo local desde el computador o desde el teléfono móvil conectado a la red local de casa:

### 1. Iniciar la infraestructura de datos
```powershell
docker compose up -d
```

### 2. Iniciar el servidor Next.js
```powershell
npm run dev
```

### 3. Abrir FitCouple
- **Desde este computador:** Abrir en el navegador [http://localhost:3005](http://localhost:3005).
- **Desde el celular (en la misma red Wi-Fi):** Abrir en el navegador móvil la dirección local indicada por la consola (ej. `http://192.168.1.43:3005`).

### 4. Detener la aplicación
- **Servidor web:** Presionar `Ctrl + C` en la terminal donde se ejecuta `npm run dev`.
- **Base de datos:** Ejecutar `docker compose stop` para pausar el contenedor preservando todos los registros de forma segura.

---


## 📦 Inventario de Equipamiento en Casa

- **Kit de mancuernas ajustables (20 kg nominales):**
  - 4 discos de 2,0 kg *(pendiente de confirmación física)*
  - 4 discos de 1,5 kg *(pendiente de confirmación física)*
  - 4 discos de 1,0 kg *(pendiente de confirmación física)*
  - 2 barras cortas con topes de seguridad (collares roscados)
  - 1 barra conectora acolchada
- **Ejercicios con peso corporal y soportes auxiliares de casa.**

---

## 🚀 Repositorio y Control de Versiones

- **Repositorio Oficial:** `https://github.com/Ronconor/fitcouple.git`
- **Rama Principal:** `main`

