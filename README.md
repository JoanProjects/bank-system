# 🏦 Sistema de Gestión Bancaria MERN

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black&style=for-the-badge) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=for-the-badge) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-4EA94B?logo=mongodb&logoColor=white&style=for-the-badge) ![Bootstrap](https://img.shields.io/badge/Bootstrap-React--Bootstrap-7952B3?logo=bootstrap&logoColor=white&style=for-the-badge)

Un sistema de gestión bancaria moderno y funcional construido con el stack MERN (MongoDB, Express, React, Node.js). Este proyecto simula operaciones bancarias esenciales como gestión de cuentas, préstamos y tarjetas, ofreciendo una interfaz de usuario intuitiva y un backend robusto basado en una arquitectura en capas.

## 🌟 Características Principales

*   **Autenticación Segura:** Registro y Login de usuarios utilizando JSON Web Tokens (JWT) y hashing de contraseñas (bcryptjs).
*   **Gestión Completa de Cuentas:**
    *   Creación de cuentas (Ahorro/Corriente).
    *   Consulta de saldos.
    *   Historial detallado de transacciones.
    *   Realización de Depósitos y Retiros.
    *   Transferencias entre cuentas internas (con validación de saldo y atomicidad mediante transacciones MongoDB).
*   **Gestión de Préstamos:**
    *   Solicitud (creación) de diferentes tipos de préstamos.
    *   Consulta de préstamos activos y su estado.
    *   Visualización de saldo pendiente.
    *   Historial de pagos realizados.
    *   Realización de pagos a préstamos desde cuentas vinculadas.
*   **Gestión de Tarjetas:**
    *   Solicitud (creación) de tarjetas de Crédito y Débito.
    *   Vinculación de tarjetas de débito a cuentas existentes.
    *   Consulta de detalles (límite, disponible, deuda, cuenta vinculada).
    *   Historial de movimientos (pagos, compras simuladas, avances).
    *   Realización de pagos a tarjetas de crédito desde cuentas.
    *   Realización de avances de efectivo (tarjetas de crédito).
    *   (Backend listo para cambiar estado: Activa, Bloqueada, etc.)
*   **Interfaz Moderna y Responsiva:** Desarrollada con React (usando Vite para un entorno de desarrollo rápido) y estilizada con Bootstrap y React-Bootstrap para una experiencia de usuario agradable en diferentes dispositivos.
*   **Backend Robusto:** Construido con Node.js y Express, siguiendo una **arquitectura en capas** (Rutas -> Controladores -> Servicios -> Acceso a Datos/Modelos) para mantenibilidad y escalabilidad.
*   **Base de Datos NoSQL:** MongoDB gestionado a través de Mongoose ODM para una interacción flexible y eficiente con los datos.

## 🛠️ Stack Tecnológico

*   **Frontend:**
    *   React (v18+) con Vite
    *   React Router DOM (v6+)
    *   Axios (para peticiones HTTP)
    *   Bootstrap 5
    *   React-Bootstrap
    *   Context API (para gestión de estado de autenticación)
*   **Backend:**
    *   Node.js (LTS)
    *   Express.js
    *   MongoDB (Base de Datos NoSQL)
    *   Mongoose (ODM para MongoDB)
    *   JSON Web Token (JWT) (para autenticación)
    *   bcryptjs (para hashing de contraseñas)
    *   dotenv (para variables de entorno)
    *   `express-validator` (opcional, para validación de entradas)
*   **Base de Datos:**
    *   MongoDB (Requiere configuración como **Replica Set** para usar Transacciones)
*   **Entorno de Desarrollo:**
    *   Desarrollado y probado en WSL2 (Subsistema de Windows para Linux)
    *   Nodemon (para recarga automática del backend)

## 🏗️ Arquitectura

El proyecto sigue una separación clara entre el frontend y el backend.

*   **Backend:** Implementa una arquitectura en capas para desacoplar responsabilidades:
    *   `routes/`: Define los endpoints de la API.
    *   `controllers/`: Maneja las peticiones HTTP, llama a los servicios y formula respuestas.
    *   `services/`: Contiene la lógica de negocio principal y orquesta las operaciones.
    *   `models/`: Define los Schemas de Mongoose y representa la estructura de datos.
    *   `middleware/`: Contiene funciones intermedias (autenticación, manejo de errores).
    *   `config/`: Configuraciones (conexión DB).
    *   `utils/`: Funciones de utilidad (ej: generador de tokens).
*   **Frontend:** Organizado por funcionalidad y tipo de componente:
    *   `api/`: Servicios para interactuar con el backend (Axios).
    *   `components/`: Componentes reutilizables (layout, common, specific).
    *   `contexts/`: Context API para estado global (ej: AuthContext).
    *   `pages/`: Componentes que representan las vistas principales de la aplicación.
    *   `routes/`: Configuración del enrutador (React Router DOM).
    *   `styles/`: Archivos CSS globales y personalizados.
    *   `utils/`: Funciones de utilidad (ej: formateadores).

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1.  **Node.js:** Versión LTS recomendada. ([Descargar Node.js](https://nodejs.org/))
2.  **npm** o **yarn:** Gestor de paquetes de Node.js (npm viene con Node.js).
3.  **MongoDB:**
    *   Instalado localmente y **configurado como un Conjunto de Réplicas (Replica Set)**, incluso si es de un solo nodo. Esto es **crucial** para que funcionen las transacciones.
    *   O una instancia en MongoDB Atlas (asegúrate de que soporte transacciones y obtén la cadena de conexión correcta).

## 🚀 Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto localmente:

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd bank-system
    ```

2.  **Instalar Dependencias del Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Instalar Dependencias del Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Configurar MongoDB como Replica Set (si es local):**
    *   Detén MongoDB: `sudo systemctl stop mongod`
    *   Edita `/etc/mongod.conf`: `sudo nano /etc/mongod.conf`
    *   Asegúrate de tener la sección `replication:` descomentada y configurada:
        ```yaml
        replication:
          replSetName: rs0 # O el nombre que prefieras
        ```
    *   Guarda el archivo y reinicia MongoDB: `sudo systemctl start mongod`
    *   Inicia el shell de Mongo: `mongosh`
    *   Inicializa el replica set: `rs.initiate()`
    *   Sal del shell: `exit`

5.  **Crear Archivos de Variables de Entorno:**

    *   **Backend:** Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido (ajusta `MONGO_URI` y `JWT_SECRET`):
        ```env
        NODE_ENV=development
        PORT=5000
        # Asegúrate de incluir ?replicaSet=rs0 si configuraste MongoDB localmente
        MONGO_URI=mongodb://127.0.0.1:27017/bankdb?replicaSet=rs0
        # ¡CAMBIA ESTE SECRETO POR UNO LARGO Y SEGURO!
        JWT_SECRET=TU_SUPER_SECRETO_AQUI_MUY_LARGO_Y_ALEATORIO
        JWT_EXPIRES_IN=30d
        ```
    *   **Frontend:** No se requiere un archivo `.env` específico para la configuración básica, ya que Vite maneja el proxy a la API.

6.  **Ejecutar la Aplicación:**

    *   **Iniciar el Servidor Backend:** Abre una terminal en el directorio `backend/`:
        ```bash
        npm run server
        ```
        El servidor backend estará escuchando en el puerto especificado en `.env` (por defecto 5000).

    *   **Iniciar el Servidor Frontend:** Abre *otra* terminal en el directorio `frontend/`:
        ```bash
        npm run dev
        ```
        La aplicación frontend estará disponible generalmente en `http://localhost:3000` o `http://localhost:5173` (Vite te indicará la URL exacta).

7.  **¡Accede a la aplicación** en tu navegador usando la URL proporcionada por Vite!

## 🔑 Variables de Entorno

El backend requiere un archivo `.env` en su raíz (`backend/.env`) con las siguientes variables:

*   `NODE_ENV`: Entorno de ejecución (`development` o `production`).
*   `PORT`: Puerto en el que escuchará el servidor backend (ej: 5000).
*   `MONGO_URI`: Cadena de conexión a tu base de datos MongoDB. **Importante:** Si usas un replica set local, añade `?replicaSet=<nombre_del_set>` (ej: `?replicaSet=rs0`).
*   `JWT_SECRET`: Clave secreta utilizada para firmar los tokens JWT. **¡Debe ser larga, segura y mantenerse privada!**
*   `JWT_EXPIRES_IN`: Tiempo de expiración de los tokens JWT (ej: `30d`, `1h`).

## 📁 Estructura de Carpetas (Simplificada)

text #
bank-system/
├── backend/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ ├── .env # Variables de entorno (¡NO versionar!)
│ ├── server.js # Punto de entrada del backend
│ └── package.json
└── frontend/
├── public/
├── src/
│ ├── api/
│ ├── assets/
│ ├── components/
│ ├── contexts/
│ ├── hooks/
│ ├── pages/
│ ├── routes/
│ ├── styles/
│ ├── utils/ # (Ej: formateadores)
│ ├── App.jsx
│ └── main.jsx # Punto de entrada del frontend
├── index.html
├── vite.config.js
└── package.json

## 👨‍💻 Autor

Joan Arroyo - FullStack Developer
