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

- **FC-1 — Git & Identidad del Proyecto (FASE ACTUAL):**  
  Inicialización limpia de Git con rama `main`, `.gitignore`, `README.md`, alcance funcional y sincronización remota con `origin`.

- **FC-2 — Infraestructura Docker Aislada:**  
  Configuración de contenedor PostgreSQL (`fitcouple-db`) en puerto `5438` (evitando conflictos con otros servicios existentes), volumen persistente `fitcouple_pgdata` y red dedicada `fitcouple_network`.

- **FC-3 — Núcleo Frontend Next.js (Mobile-First / PWA):**  
  Estructura base en Next.js con TypeScript, Tailwind CSS, configuración de puerto de desarrollo `3005`, manifest de PWA para instalación móvil y navegación táctil optimizada.

- **FC-4 — Modelado de Datos y Rutinas Iniciales (Prisma):**  
  Modelado en base de datos de usuarios, restricciones de ejercicios (filtro rodilla, control intensidad), catálogo de ejercicios compatibles con el kit de mancuernas y plantillas de rutinas iniciales personalizadas.

- **FC-5 — Flujo de Entrenamiento y Registro Rápido (MVP Funcional):**  
  Pantalla interactiva de entrenamiento activo: selección de ejercicio, guía técnica rápida, calculadora de discos de mancuernas e ingreso ágil de peso/repeticiones.

- **FC-6 — Módulo de Progreso Corporal:**  
  Registro periódico de peso y medidas corporales, con gráficas simples de evolución para cada usuario.

- **FC-7 — Pulido, Seguridad y Lanzamiento Local:**  
  Verificación de respaldos de base de datos, pruebas en dispositivos móviles en la red local y entrega del MVP listo para uso diario.
