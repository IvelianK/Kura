# 9. Lo aprendido

## Lo que haría igual

**Auditar en solo lectura antes de proponer nada.** La primera respuesta, sin mirar, sospechaba de la red, de la RAM y de OnlyOffice. Después de mirar: la RAM era caché ZFS, OnlyOffice ya evitaba la ida y vuelta por internet y Postgres ya estaba afinado. Lo único que de verdad frenaba eran los discos. Sin la auditoría se habría pasado una tarde arreglando lo que no estaba roto.

**Copia previa y vuelta atrás escrita, siempre.** Cada cambio dejó su copia con fecha en el nombre y su comando para deshacerlo. Se usó una vez, en la rotación de Valkey, y esa vez justificó todas las demás.

**En caliente siempre que se pueda.** `caddy reload`, `apachectl graceful`, `docker network connect`, rotación con dos claves válidas a la vez. El sistema se actualizó entero y se cambiaron secretos con cortes de minutos, no de horas.

**Quitar con la misma disciplina que se añade.** Retirar una aplicación es: contenedor, imagen, red, volúmenes, datos, pila, bloque del proxy, red del proxy, reescritura DNS, tarjeta del panel, nombre en el túnel y certificado guardado. Si falta uno, queda un resto que alguien encontrará dentro de un año sin saber qué es.

**Empezar los calendarios nuevos al lado de los viejos.** La sincronización con Google se montó con calendarios recién creados y una primera pasada que no podía borrar nada. Si hubiera salido mal, se borraban dos calendarios y listo.

## Lo que no haría igual

**Paralelizar sobre discos lentos.** Dieciocho descargas a la vez tumbaron el panel y Docker. En fila habría tardado menos.

**Resolver una ambigüedad hacia lo más grande.** El webmail desde cero fue una tarde de trabajo bien hecho y tirado. Una pregunta lo habría evitado.

**Mostrar ficheros enteros para comprobar una línea.** Así acabaron en una conversación un token y una contraseña. Las comprobaciones se hacen con `grep -c`, con el nombre de la variable o con un hash.

**Dejar la copia para después.** El gestor de contraseñas estuvo meses sin una sola copia. Es lo primero que debería montarse en un servidor nuevo, antes que cualquier aplicación.

## Lo que no esperaba

- **Que la mejora más grande fuera borrar.** 24 GB de imágenes, cuatro aplicaciones y una app de Nextcloud fuera. Ninguna de esas cosas se veía, y todas pesaban.
- **Que la seguridad se encontrara arreglando otra cosa.** Ninguno de los hallazgos serios salió de buscar vulnerabilidades. Salieron de configurar el correo, rotar una clave y comprobar unas copias.
- **Que el detalle visual importara tanto.** Un panel y un correo con el mismo lenguaje visual hacen que treinta y tantos servicios parezcan una sola herramienta.

---

Anterior: [Tropiezos](08-tropiezos.md) · Siguiente: [Hoja de ruta](10-hoja-de-ruta.md)
