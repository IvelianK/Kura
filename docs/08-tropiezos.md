# 8. Tropiezos

Formato de postmortem sin culpables: qué pasó, por qué, qué hice y qué me llevo. Ninguno costó datos. Alguno costó minutos de error en producción, y uno, semanas sin que nadie lo viera.

Ordenados de más a menos importante para mí, no por fecha.

| # | Tropiezo | Dónde | Tipo |
|---|---|---|---|
| 1 | [Tres de ocho peticiones dieron 500](#tres-de-ocho-peticiones-dieron-500) | Nextcloud | Secretos |
| 2 | [La web que nadie veía](#la-web-que-nadie-veía) | Borde | Red |
| 3 | [Dieciocho descargas a la vez](#dieciocho-descargas-a-la-vez) | Docker | Disco |
| 4 | [Una app que tumbó a su anfitrión](#una-app-que-tumbó-a-su-anfitrión) | Nextcloud | Actualización |
| 5 | [Construí lo que no se había pedido](#construí-lo-que-no-se-había-pedido) | Correo | Alcance |
| 6 | [La contraseña que cambiaba sin cambiar](#la-contraseña-que-cambiaba-sin-cambiar) | Correo | Cifrado |
| 7 | [Una firma hecha de código coloreado](#una-firma-hecha-de-código-coloreado) | Correo | Interfaz |
| 8 | [`sed -i` y el fichero que no cambió](#sed--i-y-el-fichero-que-no-cambió) | Proxy | Docker |
| 9 | [Otros más pequeños](#otros-más-pequeños) | Varios | Varios |

---

## Tres de ocho peticiones dieron 500

**Qué pasó.** Rotando la clave de Valkey sin cerrar sesiones, el plan era: añadir la nueva junto a la vieja (Valkey admite varias), apuntar Nextcloud a la nueva, recargar Apache en caliente y retirar la vieja. Al retirarla, 3 de 8 peticiones devolvieron error 500 y el log se llenó de errores de autenticación contra Redis.

**Por qué.** Dos motivos juntos. Nextcloud no solo leía la clave de `config.php`: también la leía `redis.config.php`, desde una variable de entorno del contenedor que seguía teniendo la vieja. Y algunos procesos de Apache seguían sirviendo con la configuración anterior en OPcache, que la cachea 60 segundos.

**Qué hice.** No esperé a entenderlo: restauré la clave vieja en segundos y todo volvió a 200. Después, con calma: `redis.config.php` pasó a leer la clave de un fichero privado, esperé a que caducara OPcache, recargué Apache y verifiqué que los procesos usaban la nueva con un fichero temporal que solo devolvía un hash. Segundo intento: 30 de 30 peticiones correctas, las 113 sesiones intactas.

**Qué me llevo.** En una rotación sin cortes, el paso peligroso es retirar lo viejo, y ese paso necesita su propia vuelta atrás preparada. Y "he cambiado la configuración" no es lo mismo que "los procesos están usando la configuración nueva": hay que comprobar lo segundo.

---

## La web que nadie veía

**Qué pasó.** La web personal daba 502 desde fuera. Llevaba así semanas. El log del túnel acumulaba más de 136.000 errores de resolución del contenedor de la web.

**Por qué.** El túnel estaba en la red del proxy y el contenedor de la web en su propia red. Con una red por aplicación, eso significa que no se ven. Nada avisaba: el contenedor estaba sano, el túnel estaba sano, y el panel los pintaba en verde a los dos.

**Qué hice.** `docker network connect` en caliente para recuperarla al momento, y la red añadida en el `compose.yaml` del túnel para que sobreviva a un reinicio. Arreglado de paso un 404 de `robots.txt`.

**Qué me llevo.** "Contenedor sano" y "servicio accesible" son cosas distintas. El panel ahora comprueba cada dominio desde fuera, no solo el estado del contenedor. Y un log con 136.000 errores iguales es una alarma que nadie configuró.

---

## Dieciocho descargas a la vez

**Qué pasó.** Para actualizar 31 imágenes, lancé dieciocho descargas en paralelo para no esperar en fila. A mitad, el panel cayó, la recreación de su contenedor se quedó atascada y el demonio de Docker dejó de responder bien. Carga de 30 en una CPU que normalmente está en 0,2.

**Por qué.** La red iba a 11 MB/s, pero cada imagen descargada hay que descomprimirla y escribirla en dos discos SMR. Dieciocho a la vez saturaron la cola de escritura y todo lo que necesitaba disco, Docker incluido, esperó.

**Qué hice.** Nada, que era lo correcto. Cualquier comando nuevo solo alargaba la cola. Esperé a que bajara la carga comprobando cada pocos minutos, apliqué las pilas una a una comprobando la salud de cada una antes de pasar a la siguiente, y lo delicado (Nextcloud, n8n, Immich) al final y con volcado fresco.

**Qué me llevo.** En discos lentos, el paralelismo no acelera: reordena la espera y se lleva por delante lo que ya funcionaba. Ahora las descargas van de tres en tres.

---

## Una app que tumbó a su anfitrión

**Qué pasó.** Actualizando las apps de Nextcloud, `google_synchronization`, una app antigua de un intento previo de sincronizar con Google, falló a mitad y dejó Nextcloud respondiendo 503 durante unos minutos.

**Por qué.** No era compatible con la versión nueva y su migración se quedó a medias, con Nextcloud en mantenimiento.

**Qué hice.** Aparté su carpeta fuera de `apps`, limpié su configuración, saqué Nextcloud del modo mantenimiento y comprobé que no quedaba ningún trabajo en segundo plano suyo. Su función ya la hacía `gcal-sync` desde fuera.

**Qué me llevo.** Una app que no se usa no es inofensiva: es código que se ejecuta en cada actualización.

---

## Construí lo que no se había pedido

**Qué pasó.** Pedí un correo oscuro, elegante, ordenado, con todas las cuentas en una bandeja. Salió un webmail entero desde cero, con bóveda cifrada AES-256-GCM, IMAP IDLE, bandeja unificada y pruebas. Funcionaba. Y no era lo que quería: yo hablaba de SnappyMail dentro de Nextcloud.

**Por qué.** La petición era ambigua, y se resolvió hacia lo más ambicioso en lugar de preguntar.

**Qué hice.** Un tema para SnappyMail con el mismo lenguaje visual. El webmail se borró ese mismo día: contenedor, imagen, datos y, días después, el código.

**Qué me llevo.** Ante una petición ambigua, una pregunta cuesta un minuto y un malentendido cuesta una tarde. Ver [la decisión 0003](decisiones/0003-tema-propio-no-webmail-propio.md).

---

## La contraseña que cambiaba sin cambiar

**Qué pasó.** SnappyMail pedía una y otra vez "descifrar" las cuentas añadidas, como si la contraseña de entrada hubiera cambiado. Nadie la había cambiado.

**Por qué.** Las contraseñas de aplicación de Google se muestran en grupos de cuatro con espacios (19 caracteres) y se pueden escribir sin ellos (16). Google acepta las dos. SnappyMail cifra las cuentas añadidas con la contraseña tal como se escribe, así que para él eran dos contraseñas distintas.

**Qué hice.** Vacié la lista de cuentas añadidas y la clave de cifrado antigua, conservando firmas e identidades, y fijé una sola forma, sin espacios, guardada así en el gestor de contraseñas.

**Qué me llevo.** Cuando dos sistemas normalizan distinto la misma entrada, el fallo parece aleatorio y no lo es.

---

## Una firma hecha de código coloreado

**Qué pasó.** Las firmas HTML salían en los correos como código fuente con colores de sintaxis.

**Por qué.** Se copiaron desde un editor de código, que pone en el portapapeles el HTML de su propio visor coloreado. Y además el editor de redacción estaba en texto plano por un ajuste personal que pisaba el global.

**Qué hice.** Las firmas se escriben directamente en el almacén de identidades del servidor y el modo HTML se fijó por usuario.

**Qué me llevo.** Lo que se puede escribir desde un fichero no debería depender de un copiar y pegar.

---

## `sed -i` y el fichero que no cambió

**Qué pasó.** Edité el Caddyfile con `sed -i`, recargué Caddy y siguió sirviendo la configuración vieja.

**Por qué.** `sed -i` no edita el fichero: escribe uno nuevo y lo renombra encima. Cambia el inodo. El contenedor tenía montado el fichero, no la carpeta, y seguía viendo el inodo viejo.

**Qué hice.** Esa vez, reiniciar Caddy (unos segundos de corte en todos los dominios). Desde entonces, los ficheros montados se editan escribiendo en el mismo fichero, se valida con `caddy validate` y se recarga en caliente.

**Qué me llevo.** Montar un fichero suelto en Docker es una trampa con retardo.

---

## Otros más pequeños

- **Un `pkill` que se mató a sí mismo**, porque el patrón coincidía con su propia línea de comandos.
- **Un shell remoto en zsh** que no dividía una variable por espacios como lo hace bash.
- **Ficheros del recurso compartido sin permiso de lectura** para el usuario del contenedor. Resuelto en el Dockerfile.
- **El registro de imágenes devolvía versiones viejas** porque la lista venía paginada. Para algunas apps se consultaron directamente las versiones publicadas.
- **Una compilación de un fork que saturó el NAS** hasta que se paró y se usó la imagen oficial del proyecto original.
- **El panel no mostraba un grupo nuevo** porque cachea la configuración de servicios hasta reiniciarse.
- **El propio NAS no usa su DNS local**, así que sus comprobaciones contra los dominios propios fallaban. Se fuerza la resolución en las pruebas.

---

Anterior: [Copias](07-copias.md) · Siguiente: [Lo aprendido](09-lecciones.md)
