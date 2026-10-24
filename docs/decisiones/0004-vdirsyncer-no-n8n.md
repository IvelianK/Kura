# 0004. vdirsyncer para el calendario, no un flujo de n8n

**Estado:** aceptada

## Contexto

Se quería que los cambios en el calendario de Nextcloud llegaran a Google y al revés. No existe de serie: Nextcloud no habla OAuth con Google y Google no avisa de los cambios. Ya había un n8n en el NAS.

## Decisión

Un contenedor propio con vdirsyncer que sincroniza los calendarios emparejados en los dos sentidos cada minuto, busca calendarios nuevos cada 10 y da prioridad a Nextcloud en los conflictos. Con un parche mínimo, aplicado al construir la imagen, para que los eventos de solo lectura que genera Google no se reintenten cada minuto.

## Alternativas descartadas

- **Flujo de n8n.** Posible, y ya instalado. Pero habría que escribir a mano la detección de cambios, las recurrencias, los borrados y los conflictos, con riesgo real de duplicados y bucles.
- **Suscripción ICS.** Solo en un sentido, de solo lectura y con horas de retraso.
- **Un cliente que muestre los dos calendarios.** Inmediato en cada dispositivo, pero los servidores seguirían sin tener los mismos eventos.

## Consecuencias

- (+) Herramienta hecha para esto, que gestiona recurrencias y conflictos.
- (+) Retraso de 20 a 60 segundos en los dos sentidos.
- (-) Invitados, recordatorios propios de Google y enlaces de videollamada pueden no copiarse idénticos.
- (-) Depende de una app de Google Cloud en producción. Si se borra el proyecto o se revoca el acceso, la sincronización se para.
