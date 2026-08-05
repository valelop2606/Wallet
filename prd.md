# Product Requirements Document

# Wallet

**Version:** 1.0

**Status:** Draft

**Last Updated:** August 4, 2026

**Owner:** Valeria Lopez

**Document Status:** Active

---

## Revision History

| Version | Date | Description | Author |
|----------|------------|-------------------------|---------------|
| 1.0 | 2026-08-04 | Initial Product Requirements Document | Valeria Lopez |

---
# 1. Overview

Wallet es una aplicación de gestión financiera personal diseñada para ayudar a las personas a organizar su dinero y avanzar hacia sus objetivos mediante una experiencia simple, visual y motivadora.

A diferencia de las aplicaciones tradicionales centradas únicamente en presupuestos o reportes financieros, Wallet combina la administración del dinero con el seguimiento de proyectos personales, permitiendo visualizar el progreso hacia metas concretas como independizarse, comprar una computadora, viajar o construir un hogar.

La aplicación ofrece una visión clara de dónde se encuentra el dinero del usuario, cómo se mueve y qué objetivos ya puede alcanzar con los recursos disponibles, transformando el ahorro en un proceso tangible y gratificante.

# 2. Problem Statement

Administrar el dinero personal suele ser un proceso fragmentado.

Muchas personas distribuyen su dinero entre cuentas bancarias, efectivo, billeteras, ahorros u otros lugares, dificultando conocer cuánto dinero poseen realmente y dónde se encuentra disponible.

Aunque existen numerosas aplicaciones para registrar gastos, la mayoría están enfocadas en presupuestos, reportes financieros o contabilidad personal. Estas herramientas suelen responder cuánto se ha gastado, pero pocas ayudan a visualizar qué puede lograrse con el dinero disponible.

Como consecuencia, ahorrar suele percibirse como acumular números en lugar de construir objetivos concretos. La falta de una representación clara del progreso hace que mantener la motivación sea más difícil.

Wallet nace para cambiar esa perspectiva, permitiendo que el usuario vea su dinero como un medio para alcanzar proyectos personales. En lugar de mostrar únicamente cifras, la aplicación transforma el ahorro en avances concretos hacia la vida que el usuario desea construir.

# 3. Product Goals

Wallet tiene como objetivo ayudar a las personas a comprender su situación financiera actual y utilizar esa información para construir los proyectos de vida que desean.

Para lograrlo, el producto deberá:

### 3.1 Proporcionar claridad financiera

Permitir que el usuario conozca cuánto dinero posee, dónde se encuentra y cómo se distribuye entre sus diferentes fuentes de dinero.

---

### 3.2 Simplificar la administración del dinero

Reducir el esfuerzo necesario para registrar movimientos financieros y mantener la información siempre actualizada.

---

### 3.3 Facilitar la planificación de proyectos

Permitir que el usuario organice proyectos personales, establezca objetivos y visualice el progreso hacia cada uno de ellos.

---

### 3.4 Transformar el ahorro en progreso visible

Representar el ahorro como avances concretos hacia proyectos de vida, permitiendo que el usuario identifique fácilmente qué objetivos ya puede alcanzar y cuáles están próximos a cumplirse.

---

### 3.5 Motivar la constancia

Generar una experiencia positiva que incentive al usuario a continuar administrando su dinero mediante pequeños logros, avances frecuentes y una representación clara del impacto de cada decisión financiera.

# 4. Target Users

Wallet está dirigido a personas que desean comprender mejor su situación financiera actual y utilizar esa información para planificar y alcanzar los objetivos que son importantes para ellas.

Aunque inicialmente el producto será utilizado por una única persona, la arquitectura estará preparada para soportar múltiples usuarios en futuras versiones.

Los usuarios de Wallet suelen compartir una o más de las siguientes necesidades:

- Tener una visión clara de cuánto dinero poseen y dónde se encuentra.
- Administrar dinero distribuido entre diferentes fuentes, como cuentas bancarias, efectivo o ahorros.
- Registrar movimientos financieros de forma rápida y sencilla.
- Organizar objetivos que requieren planificación financiera.
- Visualizar el progreso hacia sus objetivos sin necesidad de realizar cálculos manuales.
- Utilizar una herramienta intuitiva que priorice la simplicidad sobre la complejidad financiera.

# 5. Scope

## 5.1 In Scope

La versión 1.0 de Wallet incluirá las siguientes funcionalidades:

## Autenticación

* Registro de usuario.
* Inicio y cierre de sesión.

---

## Gestión de dinero

* Crear, editar y eliminar fuentes de dinero.
* Visualizar el saldo disponible en cada fuente.
* Consultar el saldo total del usuario.

Ejemplos de fuentes de dinero:

* Cuenta bancaria.
* Billetera.
* Efectivo.
* Ahorros.

---

## Movimientos

* Registrar ingresos.
* Registrar gastos.
* Registrar transferencias entre fuentes de dinero.
* Consultar historial de movimientos.

---

## Objetivos

Los usuarios podrán crear objetivos individuales sin necesidad de pertenecer a un proyecto.

Cada objetivo podrá tener:

* Nombre.
* Descripción.
* Monto objetivo.
* Progreso.
* Estado.

Los objetivos podrán:

* Completar su progreso de forma independiente.
* Ser asociados posteriormente a un proyecto.
* Mantener su historial y estado al integrarse a un proyecto.

Ejemplo:

Objetivo:

* Comprar audífonos.

Posteriormente puede incorporarse al proyecto:

* Crear un set de DJ.

---

## Proyectos

Los usuarios podrán crear proyectos para agrupar objetivos relacionados.

Cada proyecto podrá contener:

* Múltiples objetivos.
* Progreso general.
* Objetivos completados.
* Nuevos objetivos pendientes.

Ejemplos:

* Primera casa.
* Viaje.
* Set de DJ.
* Emprendimiento.

---

## Ahorros

Wallet permitirá crear espacios de ahorro independientes para dinero destinado a guardar sin necesidad de asociarlo a objetivos específicos.

Ejemplos:

* Fondo de emergencia.
* Fondo de inversión.
* Ahorro general.

Los ahorros tendrán:

* Nombre.
* Monto destinado.
* Progreso.
* Visualización en el dashboard.

---

## Dashboard

El usuario podrá visualizar:

* Situación financiera actual.
* Distribución del dinero.
* Movimientos recientes.
* Progreso de objetivos.
* Progreso de proyectos.
* Estado de sus ahorros.

---

# 5.2 Out of Scope

Las siguientes funcionalidades no formarán parte de la versión 1.0:

* Sincronización con bancos.
* Múltiples monedas.
* Múltiples cuentas bancarias con integración automática.
* Presupuestos mensuales.
* Recordatorios.
* Notificaciones.
* Estadísticas avanzadas.
* Exportación de datos.
* Integraciones externas.
* Inteligencia Artificial.

# 6 Functional Requirements
## 6.1 User Management

### FR-001

El sistema permitirá al usuario crear una cuenta mediante registro.

### FR-002

El sistema permitirá al usuario iniciar sesión.

### FR-003

El sistema permitirá al usuario cerrar sesión.

### FR-004

El sistema deberá mantener la información financiera asociada a cada usuario de forma independiente.
## 6.2 Money Sources

### FR-005

El sistema permitirá al usuario crear diferentes fuentes de dinero.

### FR-006

Cada fuente de dinero tendrá:

- Nombre.
- Tipo.
- Saldo actual.
- Descripción opcional.

### FR-007

El usuario podrá editar la información de una fuente de dinero.

### FR-008

El usuario podrá eliminar una fuente de dinero cuando no tenga movimientos asociados.

### FR-009

El sistema permitirá visualizar el saldo individual de cada fuente de dinero.

### FR-010

El sistema permitirá visualizar el saldo total disponible considerando todas las fuentes de dinero.

### FR-011

El sistema permitirá crear fuentes personalizadas para adaptarse a la forma en la que cada usuario organiza su dinero.

Ejemplos:

- Billetera.
- Mochila.
- Cuenta bancaria.
- Efectivo guardado.
- Otros lugares definidos por el usuario.

### FR-012

El sistema no permitirá que una fuente de dinero tenga saldo negativo.
## 6.3 Transactions

### FR-013

El sistema permitirá al usuario registrar movimientos financieros.

### FR-014

El sistema soportará los siguientes tipos de movimientos:

- Ingreso.
- Gasto.
- Transferencia.

### FR-015

Cada movimiento deberá contener:

- Tipo de movimiento.
- Monto.
- Fecha.
- Descripción.
- Fuente de dinero asociada.
- Categoría opcional.

### FR-016

Los ingresos aumentarán el saldo de la fuente de dinero seleccionada.

### FR-017

Los gastos disminuirán el saldo de la fuente de dinero seleccionada.

### FR-018

Las transferencias permitirán mover dinero entre diferentes fuentes sin modificar el dinero total del usuario.

### FR-019

El sistema permitirá consultar un historial de movimientos.

### FR-020

El usuario podrá editar movimientos registrados.

### FR-021

El usuario podrá anular movimientos registrados sin perder el historial financiero.
## 6.4 Savings

### FR-022

El sistema permitirá al usuario crear espacios de ahorro independientes.

### FR-023

Cada ahorro deberá contener:

- Nombre.
- Descripción opcional.
- Monto actual.
- Fecha de creación.
- Lugar de almacenamiento.

### FR-024

El usuario podrá definir una meta opcional para un ahorro.

### FR-025

El usuario podrá editar sus espacios de ahorro.

### FR-026

El usuario podrá visualizar el progreso de un ahorro cuando tenga una meta definida.

### FR-027

El usuario podrá transferir dinero desde una fuente de dinero hacia un ahorro.

### FR-028

El usuario podrá retirar dinero de un ahorro hacia una fuente de dinero disponible.

### FR-029

El sistema permitirá visualizar los ahorros dentro del resumen financiero general.

### FR-030

Los ahorros no requerirán objetivos asociados para existir.
### FR-041

Los objetivos asociados a un proyecto recibirán automáticamente dinero desde el fondo asignado al proyecto.

### FR-042

Los objetivos dentro de un proyecto serán priorizados automáticamente según el orden definido por el sistema.

### FR-043

El sistema conservará objetivos completados en un historial de objetivos alcanzados.

### FR-044

El sistema permitirá retirar dinero asignado a objetivos o proyectos, actualizando su progreso sin eliminar el historial.

### FR-045

El dashboard diferenciará entre dinero disponible y dinero asignado a objetivos o proyectos.
## 6.6 Projects

### FR-046

El sistema permitirá al usuario crear proyectos.

### FR-047

Cada proyecto deberá contener:

- Nombre.
- Descripción opcional.
- Fecha de creación.
- Estado.
- Objetivos asociados.

### FR-048

El usuario podrá crear proyectos sin objetivos iniciales.

### FR-049

El usuario podrá agregar objetivos existentes a un proyecto.

### FR-050

El usuario podrá crear nuevos objetivos dentro de un proyecto.

### FR-051

Un objetivo solamente podrá pertenecer a un proyecto a la vez.

### FR-052

El usuario podrá retirar objetivos de un proyecto sin eliminar el objetivo.

### FR-053

El sistema calculará el progreso general de un proyecto basado en sus objetivos asociados.

### FR-054

El usuario podrá asignar dinero a un proyecto.

### FR-055

El dinero asignado a un proyecto será distribuido automáticamente entre sus objetivos según las reglas definidas.

### FR-056

El sistema permitirá visualizar objetivos completados y pendientes dentro de un proyecto.

### FR-057

Los proyectos completados se conservarán en un historial.

### FR-058

El sistema actualizará automáticamente el estado de un proyecto cuando todos sus objetivos hayan alcanzado el monto requerido.

### FR-059

El sistema permitirá marcar un proyecto como comprado cuando todos sus objetivos hayan sido adquiridos.

### FR-060

Si un proyecto completado recibe nuevos objetivos, cambiará nuevamente a estado activo.
## 6.7 Dashboard

### FR-061

El sistema mostrará un resumen general de la situación financiera del usuario.

### FR-062

El dashboard mostrará el dinero disponible actual.

Este valor representará únicamente dinero libre para utilizar.

### FR-063

El dashboard mostrará las fuentes de dinero disponibles.

Ejemplos:

- Billetera.
- Mochila.
- Cuenta bancaria.
- Otras fuentes personalizadas.

### FR-064

El dashboard mostrará el dinero asignado a objetivos y proyectos.

### FR-065

El dashboard mostrará los espacios de ahorro del usuario:

- Ahorro libre.
- Fondo de emergencia.
- Fondo de inversión.

### FR-066

El sistema diferenciará entre:

- Dinero disponible.
- Dinero asignado.
- Dinero ahorrado.

### FR-067

El dashboard mostrará el patrimonio total del usuario como información secundaria.

El patrimonio será calculado como:

Dinero disponible + dinero asignado + dinero ahorrado.

### FR-068

El dashboard mostrará objetivos activos y su progreso.

### FR-069

El dashboard mostrará proyectos activos y su progreso.

### FR-070

El dashboard identificará objetivos alcanzables según los recursos disponibles.

### FR-071

El dashboard mostrará movimientos recientes.

### FR-072

El dashboard mostrará una sección de logros e historial de objetivos y proyectos.
# Business Rules
## 7.1 Money Rules

### BR-001

Una fuente de dinero no puede tener saldo negativo.

Cada fuente representa dinero disponible actualmente.

Si un usuario realiza un gasto mayor al saldo de una fuente, deberá utilizar otras fuentes de dinero disponibles.

Ejemplo:

Billetera:
50 Bs

Mochila:
20 Bs

Compra:
70 Bs

Resultado:

Billetera:
-50 Bs

Mochila:
-20 Bs

---

### BR-002

Una transferencia entre fuentes de dinero no modifica el patrimonio total del usuario.

Las transferencias únicamente cambian la ubicación del dinero.

Ejemplo:

Banco:
1000 Bs

Transferencia:
200 Bs

Resultado:

Banco:
800 Bs

Billetera:
200 Bs

Total:
1000 Bs
## 7.2 Transaction Rules

### BR-003

Los movimientos financieros no serán eliminados físicamente.

Cuando un movimiento sea corregido, deberá conservar su historial mediante un estado de anulación.

### BR-004

Una compra realizada desde un objetivo o proyecto deberá registrarse como un gasto real dentro del sistema.

### BR-005

Una compra no podrá revertirse eliminando el movimiento original.

Si el usuario recupera dinero posteriormente, deberá registrarse como un nuevo movimiento.
## 7.3 Savings Rules

### BR-006

Los ahorros representan dinero separado del dinero disponible.

El dinero asignado a un ahorro no debe considerarse disponible para gastos cotidianos.

### BR-007

Los ahorros pueden tener una meta definida, pero esta es opcional.

Ejemplo:

Fondo de emergencia:
Meta: 5000 Bs

Fondo de inversión:
Sin meta definida.
## 7.4 Objective Rules

### BR-008

Un objetivo puede existir independientemente de un proyecto.

### BR-009

Un objetivo solamente puede pertenecer a un proyecto a la vez.

### BR-010

Completar un objetivo no significa comprarlo.

Estados del objetivo:

- Pendiente.
- En progreso.
- Completado.
- Comprado.

### BR-011

Cuando un objetivo alcanza su monto objetivo, permanece como dinero asignado hasta que el usuario registre la compra.

### BR-012

Cuando un objetivo es comprado:

- El dinero deja de estar asignado.
- Se registra un gasto.
- El objetivo pasa al historial.
## 7.5 Project Rules

### BR-013

Un proyecto puede existir sin objetivos iniciales.

### BR-014

El dinero asignado a un proyecto será distribuido automáticamente entre sus objetivos.

### BR-015

Los objetivos dentro de un proyecto seguirán un orden automático de prioridad.

Inicialmente:

- Menor monto requerido primero.
- Mayor monto requerido después.

### BR-016

Cuando un proyecto pierde dinero asignado:

- La reducción comenzará desde el objetivo de mayor costo.
- Los estados de los objetivos serán actualizados automáticamente.

### BR-017

Un proyecto puede tener diferentes estados:

- Activo.
- Completado.
- Comprado.

### BR-018

Un proyecto se marca como completado automáticamente cuando todos sus objetivos alcanzan el monto requerido.

Si se agregan nuevos objetivos, volverá a estado activo.

### BR-019

Un proyecto se marca como comprado cuando todos sus objetivos han sido adquiridos.
## 7.6 Dashboard Rules

### BR-020

El dinero disponible representa únicamente dinero libre para utilizar.

### BR-021

El dinero asignado a objetivos, proyectos y ahorros no debe mezclarse con el dinero disponible.

### BR-022

El patrimonio total del usuario será calculado como:

Dinero disponible + dinero asignado + dinero ahorrado.

Este valor será mostrado como información secundaria.
# Non-Functional Requirements
## 8.1 Usability

### NFR-001

La aplicación deberá permitir registrar un movimiento financiero de forma rápida y sencilla.

### NFR-002

La interfaz deberá priorizar la claridad sobre la cantidad de información mostrada.

### NFR-003

El usuario deberá poder identificar rápidamente:

- Cuánto dinero tiene disponible.
- Dónde está su dinero.
- Cuánto dinero está asignado.
- Qué objetivos tiene activos.

### NFR-004

La aplicación deberá minimizar la cantidad de pasos necesarios para registrar gastos frecuentes.

### NFR-005

La información financiera deberá presentarse utilizando lenguaje sencillo y comprensible.
## 8.2 Security

### NFR-006

La información financiera de cada usuario deberá estar aislada y protegida.

### NFR-007

Las contraseñas deberán almacenarse utilizando métodos seguros de cifrado.

### NFR-008

El usuario deberá autenticarse para acceder a su información financiera.

### NFR-009

La aplicación deberá evitar exponer información sensible de los usuarios.
## 8.3 Performance

### NFR-010

Las pantallas principales deberán cargar rápidamente.

### NFR-011

Las operaciones comunes como registrar gastos, consultar saldos y actualizar objetivos deberán ejecutarse sin retrasos perceptibles.

### NFR-012

El sistema deberá soportar el crecimiento progresivo de información financiera del usuario.
## 8.4 Compatibility

### NFR-013

La aplicación deberá estar optimizada para dispositivos móviles.

### NFR-014

La interfaz deberá adaptarse correctamente a diferentes tamaños de pantalla.

### NFR-015

La aplicación deberá ser accesible desde navegadores modernos.

### NFR-016

El funcionamiento sin conexión será considerado como una mejora futura.
## 8.5 Maintainability

### NFR-016

El código deberá mantener una estructura organizada y modular.

### NFR-017

Las funcionalidades deberán estar separadas por módulos independientes.

### NFR-018

El proyecto deberá incluir documentación suficiente para facilitar futuras modificaciones.

### NFR-019

La arquitectura deberá permitir agregar nuevas funcionalidades sin afectar componentes existentes.
# Success Metrics
## 9.1 User Experience Metrics

### SM-001

El usuario debe poder conocer su dinero disponible actual rápidamente al abrir la aplicación.

### SM-002

El usuario debe poder identificar dónde se encuentra su dinero sin realizar cálculos manuales.

### SM-003

El usuario debe poder registrar un movimiento financiero sin que el proceso resulte pesado o complicado.

### SM-004

El usuario debe sentir mayor claridad sobre su situación financiera después de utilizar la aplicación.
## 9.2 Organization Metrics

### SM-005

El usuario debe poder mantener actualizadas sus diferentes fuentes de dinero.

### SM-006

El usuario debe poder distinguir correctamente entre:

- Dinero disponible.
- Dinero asignado.
- Dinero ahorrado.

### SM-007

El sistema debe reducir la necesidad de recordar manualmente la ubicación del dinero.
## 9.3 Planning Metrics

### SM-008

El usuario debe poder visualizar el progreso de sus objetivos y proyectos.

### SM-009

El usuario debe poder identificar qué objetivos puede alcanzar con sus recursos actuales.

### SM-010

El usuario debe poder conservar un historial de logros financieros personales.
## 9.4 Personal Value Metrics

### SM-011

Wallet debe disminuir la carga mental asociada al manejo del dinero.

### SM-012

Wallet debe permitir al usuario tomar decisiones financieras con mayor confianza.

### SM-013

Wallet debe funcionar como una representación clara de la situación financiera personal.
# Future Vision 
## 10.1 Advanced Financial Management

Funcionalidades futuras:

- Presupuestos mensuales.
- Límites de gasto.
- Seguimiento de hábitos financieros.
- Categorías de gastos.
- Análisis avanzado de movimientos.
- Estadísticas financieras personalizadas.
## 10.2 Banking Integration

Funcionalidades futuras:

- Sincronización con cuentas bancarias.
- Importación automática de movimientos.
- Actualización automática de saldos.
- Conexión con diferentes instituciones financieras.
## 10.3 Multiple Currencies

Funcionalidades futuras:

- Manejo de múltiples monedas.
- Conversión automática de valores.
- Visualización de patrimonio en diferentes monedas.
## 10.4 Notifications and Reminders

Funcionalidades futuras:

- Recordatorios de pagos.
- Alertas de objetivos.
- Avisos de progreso.
- Recordatorios personalizados.
## 10.5 Advanced Goals and Projects

Funcionalidades futuras:

- Plantillas de proyectos.
- Recomendaciones automáticas.
- Predicción de fechas de cumplimiento.
- Comparación entre diferentes planes financieros.
## 10.6 Data Export and Backup

Funcionalidades futuras:

- Exportación de información financiera.
- Reportes en diferentes formatos.
- Copias de seguridad.
- Restauración de datos.
## 10.7 Investment Management

Funcionalidades futuras:

- Seguimiento avanzado de inversiones.
- Registro de activos.
- Evolución del patrimonio.
- Análisis de rendimiento.
## 10.8 Offline Experience

Funcionalidad futura:

- Uso parcial de la aplicación sin conexión.
- Sincronización automática cuando vuelva internet.
# Technical Considerations
## 11.1 Development Approach

Wallet será desarrollado inicialmente como una aplicación web responsive orientada a dispositivos móviles.

El objetivo inicial será crear una experiencia optimizada para uso personal desde celular.

La arquitectura deberá permitir una futura evolución hacia aplicaciones móviles nativas si fuese necesario.
## 11.2 Technology Stack

### Frontend

- React.
- TypeScript.
- Tailwind CSS.

### Backend

- Node.js.
- Express.

### Database

- PostgreSQL.

### Authentication

- JWT.

### Version Control

- Git.
- GitHub.
## 11.3 Architectur 
Wallet

Frontend
│
│ HTTP Requests
↓
Backend API
│
↓
PostgreSQL

src

frontend/
 ├── components
 ├── pages
 ├── services
 └── hooks


backend/
 ├── controllers
 ├── services
 ├── models
 ├── routes
 └── database

## 11.4 AI-Assisted Development

El desarrollo podrá apoyarse mediante herramientas de inteligencia artificial.

La IA será utilizada como asistente de programación para:

- Generar código.
- Explicar implementaciones.
- Proponer soluciones.
- Revisar errores.
- Mejorar estructura.

El usuario deberá comprender la lógica y validar las decisiones técnicas antes de incorporar cambios.
## 11.5 Main Entities

El sistema deberá manejar como mínimo:

- User.
- Money Source.
- Transaction.
- Saving.
- Objective.
- Project.
- Achievement.
## 11.6 Deployment

La aplicación deberá poder desplegarse utilizando servicios accesibles para proyectos personales.

Inicialmente se priorizarán soluciones gratuitas o de bajo costo.
