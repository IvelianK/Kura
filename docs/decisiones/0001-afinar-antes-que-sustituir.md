# 0001. Afinar Nextcloud antes que sustituirlo

**Estado:** aceptada

## Contexto

Nextcloud se sentía lento: correo con minutos de retraso, OnlyOffice pesado al abrir. La tentación era cambiarlo por algo "más rápido": Stalwart para correo y agenda, Grommunio como alternativa tipo Exchange, Seafile para archivos.

La auditoría en solo lectura mostró que la CPU estaba al 0,2, que la RAM alta era caché ZFS y que todo, base de datos incluida, vivía en dos discos SMR. El cuello de botella eran los discos, no Nextcloud.

## Decisión

Mantener Nextcloud como interfaz única y quitar trabajo a los discos: compresión en el proxy, cron frecuente, OPcache, Postgres afinado, tráfico interno por la red local. Sustituir solo la pieza con un defecto de diseño: la app Mail, que no avisa al instante.

## Alternativas descartadas

- **Grommunio.** Lo más parecido a una suite tipo Google, con avisos al instante. Pesado, con modelo de suscripción, y sobre los mismos discos daría una mejora parecida.
- **Stalwart y piezas sueltas.** Muy rápido, pero sin interfaz web propia de calidad. Romper la interfaz única era lo contrario de lo que se buscaba.
- **Seafile.** Más rápido sirviendo ficheros, pero solo cubre archivos: calendario, contactos y ofimática quedarían fuera de la interfaz única.
- **Comprar un NVMe ya.** La mejora correcta, aplazada por presupuesto. Está en la hoja de ruta.

## Consecuencias

- (+) Sin migraciones, sin aprender otra herramienta, y todo reversible.
- (+) Mejoras medibles: el editor de documentos baja de 28,9 MB a 5,1 MB por apertura.
- (-) El techo sigue siendo el disco. La web general de Nextcloud apenas mejora hasta que llegue el NVMe.
