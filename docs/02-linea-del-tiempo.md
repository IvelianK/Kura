# 2. Línea del tiempo

La mayor parte del trabajo cabe en tres jornadas largas de octubre de 2026, porque trabajé con un asistente de IA con acceso de administrador al NAS, primero en solo lectura para auditar y después aplicando cambios con copia previa. La regla fue siempre la misma: el asistente propone, enseña la vuelta atrás y espera; yo decido. Varias de sus propuestas no salieron adelante, y en un par de ocasiones fui yo quien paró a mitad.

## Vista general

```mermaid
timeline
    title De un NAS que funciona a un NAS en el que confío
    section Antes
        Montaje : TrueNAS SCALE : espejo de 2 x 4 TB : apps añadidas sobre la marcha
    section 1 de octubre
        Auditoría : solo lectura : el disco es el techo
        Rendimiento : compresión en el proxy : cron cada minuto : Postgres afinado
        Correo : SnappyMail : tres cuentas cifradas : firmas y tema propio
        Calendario : Google y Nextcloud en los dos sentidos
    section 4 de octubre
        Limpieza : app Mail borrada : cuatro apps fuera : 24 GB de imágenes
        Seguridad : secreto rotado en caliente : web personal reparada
        Actualización : 31 imágenes : Nextcloud, Immich, n8n
        Copias : volcados de BBDD : Zerobyte semanal y mensual
        Panel : rediseño completo
    section Después
        11 de octubre : primera copia semanal real : 224 GB de fotos
        18 de octubre : simulacro de restauración
        19 de octubre : openGym, dentro y fuera en una tarde
        20 de octubre : Syncthing para los equipos de casa
```

## En un diagrama de Gantt

```mermaid
gantt
    title Octubre de 2026
    dateFormat YYYY-MM-DD
    axisFormat %d %b
    section Rendimiento y correo
    Auditoría en solo lectura         :done, a1, 2026-10-01, 1d
    Ajustes de Nextcloud y OnlyOffice :done, a2, 2026-10-01, 1d
    SnappyMail, cuentas y firmas      :done, a3, 2026-10-01, 1d
    Sincronización con Google         :milestone, m1, 2026-10-01, 0d
    section Orden
    Limpieza y rotación de secretos   :done, b1, 2026-10-04, 1d
    Actualización general             :done, b2, 2026-10-04, 1d
    Copias configuradas y probadas    :milestone, m2, 2026-10-04, 0d
    section Operación
    Primera copia semanal real        :milestone, m3, 2026-10-11, 0d
    Simulacro de restauración         :done, c1, 2026-10-18, 1d
    openGym                           :done, c2, 2026-10-19, 1d
    Syncthing                         :done, c3, 2026-10-20, 4d
```

## Cómo cambió el sistema

Espacio ocupado por Docker. La limpieza del 4 de octubre fue la mejora más grande del mes y no añadió nada.

```mermaid
xychart-beta
    title "Espacio de Docker (GB)"
    x-axis ["1 oct", "4 oct antes", "4 oct después", "24 oct"]
    y-axis "GB" 0 --> 50
    bar [41.8, 43.2, 19.0, 19.6]
```

Y el número de servicios expuestos a internet, que es la cifra que de verdad mide la superficie de ataque:

```mermaid
xychart-beta
    title "Nombres de host publicados en el túnel"
    x-axis ["1 oct", "4 oct", "19 oct", "24 oct"]
    y-axis "Nombres de host" 0 --> 16
    line [15, 11, 12, 11]
```

## Los hitos, contados

**1 de octubre, mañana.** Empezó con una pregunta sencilla: si el correo de Nextcloud podía ser instantáneo y OnlyOffice "mil veces más rápido". La respuesta fue que no, y por qué. Una auditoría en solo lectura por la API de TrueNAS dejó claro el techo: todo, base de datos incluida, vivía en dos discos SMR. La CPU estaba al 0,2 de carga.

**1 de octubre, tarde.** Sin comprar hardware: compresión en Caddy (el editor de documentos bajó de 28,9 a 5,1 MB), cron cada minuto, OPcache a 256 MB, Postgres con menos sincronización a disco, OnlyOffice hablando con Nextcloud por la red interna. Después, SnappyMail en lugar de la app Mail, con tres cuentas que antes iban mal configuradas o sin cifrar, firmas por identidad y autocompletado de destinatarios.

**1 de octubre, tarde y noche.** El tema visual. Pedí algo oscuro, elegante y ordenado; primero salió un webmail entero hecho desde cero, que no era lo que quería, y después un tema para SnappyMail, que sí. Luego, el calendario: un contenedor con vdirsyncer que sincroniza Nextcloud y Google en los dos sentidos cada minuto.

**4 de octubre.** El día del orden. La app Mail borrada con sus credenciales, la web personal reparada tras semanas caída, el secreto de Valkey rotado sin cerrar una sola sesión, 137 contactos importados, cuatro aplicaciones eliminadas con todos sus restos, 31 imágenes actualizadas (Immich con un salto de versión mayor), las copias programadas y probadas, y el panel rediseñado dos veces.

**11 de octubre.** La primera copia semanal real. Tardó varias horas porque subía las fotos completas por primera vez. Las siguientes son incrementales y duran minutos.

**18 de octubre.** Simulacro de restauración. Vaultwarden y la base de datos de Nextcloud levantados desde la copia en un entorno aparte, y comparados con los vivos. Contado en [Copias](07-copias.md#el-simulacro).

**19 de octubre.** openGym instalado, publicado con certificado real y retirado del todo esa misma tarde por decisión mía. Un buen ensayo de que el sistema admite añadir y quitar piezas limpiamente.

**20 de octubre.** Syncthing en el NAS. Empieza a servir también a los demás equipos de la casa.

**Lo siguiente.** Está en la [hoja de ruta](10-hoja-de-ruta.md).

---

Anterior: [Punto de partida](01-punto-de-partida.md) · Siguiente: [Arquitectura](03-arquitectura.md)
