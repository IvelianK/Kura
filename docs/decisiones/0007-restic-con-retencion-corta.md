# 0007. restic con dos copias por trabajo

**Estado:** aceptada

## Contexto

Había instantáneas mensuales de algunos conjuntos de datos y ninguna del gestor de contraseñas ni de la base de datos de Nextcloud. El requisito: semanal para lo importante, mensual para lo secundario, domingo a las 04:00 y como mucho dos copias, para que no pesen.

## Decisión

Zerobyte como interfaz sobre restic, con un repositorio cifrado y deduplicado en un conjunto de datos propio. Orígenes montados en solo lectura. Un volcado de todas las bases de datos a las 03:30, para que la copia guarde volcados consistentes y no carpetas vivas. Retención de dos copias por trabajo. Un simulacro de restauración después de la primera copia real.

## Alternativas descartadas

- **Más instantáneas ZFS.** Baratas e inmediatas, pero viven en el mismo pool y no se pueden llevar fuera de casa tal cual.
- **Copiar las carpetas de Postgres en marcha.** Rápido, y con riesgo de que la copia no arranque.
- **Retención larga.** Más protección contra un fallo descubierto muy tarde, y más espacio del que hay hoy.

## Consecuencias

- (+) Lo que más duele perder tiene copia semanal, cifrada y comprobada.
- (+) Con deduplicación, la segunda copia ocupa solo lo que cambió.
- (-) La segunda ubicación de copias es lo primero de la hoja de ruta.
- (-) Dos copias son poco margen si un fallo se descubre tres semanas tarde.
