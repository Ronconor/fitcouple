# FitCouple — Alcance Funcional y Plan de Fases

## 1. Alcance Funcional del Proyecto

FitCouple es una aplicación privada para dos usuarios específicos con el objetivo exclusivo de planificar, ejecutar y registrar sus entrenamientos físicos caseros y progreso corporal.

### Usuarios y Condiciones Declaradas

| Perfil | Datos Base | Meta Orientativa | Condiciones / Restricciones Declaradas | Enfoque de Rutina |
| :--- | :--- | :--- | :--- | :--- |
| **Usuario 1 (Él)** | 45 años, 175 cm, 90 kg | 82 kg | Hipertensión arterial tratada medicamente. | Fuerza progresiva, quema de grasa abdominal, control de esfuerzo cardiovascular y descansos adecuados. |
| **Usuario 2 (Ella)** | 43 años, 66 kg | 62 kg | Lesión en rodilla derecha: **Prohibido correr, saltar y realizar sentadillas profundas.** | Recomposición corporal: enfoque en glúteos, femoral/isquiotibiales seguros, tren superior, abdomen y tonificación sin impacto articular. |

> **Nota de Seguridad Médica:** Los registros de salud representan límites declarados por los propios usuarios para filtrar ejercicios y prevenir lesiones. La aplicación no sustituye la supervisión de un médico o fisioterapeuta.

### Equipamiento en Casa
- Kit de mancuernas de 20 kg nominales:
  - 4 discos de 2,0 kg *(pendiente de confirmación física)*
  - 4 discos de 1,5 kg *(pendiente de confirmación física)*
  - 4 discos de 1,0 kg *(pendiente de confirmación física)*
  - 2 barras cortas, 1 barra conectora y seguros de rosca.
- Peso corporal.

---

## 2. Lo que NO se Construirá (Anti-SaaS / Exclusiones Explícitas)

- ❌ Multiempresa o multitenancy.
- ❌ Pasarelas de pago, suscripciones, pasarelas bancarias.
- ❌ Roles complejos (no hay administradores de gimnasio, clientes ni entrenadores externos).
- ❌ Red social pública o feeds comunitarios.
- ❌ Diagnósticos automáticos o prescripciones médicas automatizadas.

---

## 3. Plan de Fases Hacia un MVP Realmente Utilizable

El plan está diseñado para llegar lo más rápido posible a una versión 1.0 (MVP) que permita a la pareja empezar a entrenar y registrar sus sesiones desde el celular.

```
FC-0 [Auditoría Entorno] ➔ FC-1 [Git & Identidad] ➔ FC-2 [Docker DB]
                                                          │
FC-5 [Registro & Sesiones] ◄─ FC-4 [Datos & Rutinas] ◄──── FC-3 [Next.js Core PWA]
          │
FC-6 [Visualización Progreso] ➔ FC-7 [Hardening & Lanzamiento MVP]
```

### Detalle de Fases:

- **FC-0 — Auditoría de Entorno & Repositorio (COMPLETADA):**  
  Verificación en modo solo lectura de herramientas, puertos, Docker y remoto.

- **FC-1 & FC-1.1 — Git & Identidad del Proyecto (COMPLETADA):**  
  Inicialización limpia de Git con rama `main`, `.gitignore`, `README.md`, alcance funcional e identidad aislada `Ronconor <f.roncallo@gmail.com>`.

- **FC-2 — Infraestructura Docker Aislada (COMPLETADA):**  
  Contenedor PostgreSQL 16 (`fitcouple-db-1`) en puerto `5438`, volumen persistente `fitcouple_postgres_data` y healthcheck.

- **FC-3 — Núcleo Frontend Next.js Mobile-First (COMPLETADA):**  
  Estructura base en Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma 6 y conexión a PostgreSQL.

- **FC-4 — Acceso Privado y Dos Perfiles Individuales (COMPLETADA):**  
  Autenticación robusta con bcrypt, tokens HMAC-SHA256, cookies HttpOnly, protección contra fuerza bruta y aislamiento estricto de perfiles.

- **FC-5 — Planes Semanales Personalizados y Catálogo (COMPLETADA):**  
  Catálogo de 21 ejercicios adaptados para casa, planes de 7 días para Él (control cardiovascular) y Ella (cero impacto, cero saltos, sentadilla en rango protegido).

- **FC-6 — Registro de Entrenamientos e Historial (COMPLETADA):**  
  Sesión activa de entrenamiento ("Empezar entrenamiento"), registro ágil de series, repeticiones y cargas (kg/lb con conversión limpia), temporizador de descanso, finalización de sesión con notas e historial individual expandible con aislamiento total.

- **FC-7 — Módulo de Progreso Corporal y Métricas (COMPLETADA):**  
  Registro periódico de peso y medidas corporales (cintura, cadera, pecho, brazo, muslo), gráficos cronológicos reales (sin interpolaciones artificiales), resumen neutro de cambios e historial ordenado con aislamiento total.

- **FC-8 — Pulido Final, Hardening & Despliegue Local (SIGUIENTE FASE):**  
  Revisión final de seguridad, auditoría de respaldos locales de PostgreSQL y verificación de acceso en red local para uso cotidiano de la pareja.


