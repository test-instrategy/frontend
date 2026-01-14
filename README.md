# Dashboard de Ventas Full-Stack

Este proyecto es un sistema de gestión y visualización de ventas desarrollado como parte de un reto técnico de prácticas pre-profesionales.

## Stack Tecnológico
- **Frontend**: Angular (Standalone Components), NG-ZORRO UI, Tailwind CSS.
- **Backend**: Node.js + Express.
- **Base de Datos**: Google Cloud Platform (Firebase Firestore).
- **Visualización**: AntV G2Plot.

## Arquitectura y Patrones
- **Manejo de Errores Global**: Implementación de un `HttpInterceptor` para capturar errores de red centralizadamente.
- **Carga Asíncrona Proactiva**: Uso de `nz-skeleton` y `nz-spin` para mejorar la experiencia de usuario (UX) durante las peticiones a la API.
- **Backend Agregado**: Los cálculos de KPIs (Total, Promedio) se delegan al servidor para optimizar el rendimiento del cliente.
- **Configuración Dinámica**: El catálogo de categorías y marcas se consume desde Firestore, permitiendo actualizaciones sin redeploy.

## ⚙️ Instalación y Uso
1. **Backend**: 
   - `cd backend`
   - `npm install`
   - `node server.js`
2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `ng serve`