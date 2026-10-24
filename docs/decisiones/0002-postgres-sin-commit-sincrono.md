# 0002. Postgres sin commit síncrono sobre discos duros

**Estado:** aceptada, provisional hasta el NVMe y el SAI

## Contexto

Cada escritura de Nextcloud (un evento, un fichero indexado, una sesión) termina en un `fsync` de Postgres sobre dos discos SMR en espejo. Es la operación más cara que se les puede pedir.

## Decisión

`synchronous_commit=off`, checkpoints cada 15 minutos, `max_wal_size=4GB` y `wal_compression=on`, aplicados con `ALTER SYSTEM` para poder revertirlos con un solo comando.

## Alternativas descartadas

- **Dejarlo como estaba.** Seguro, y lento en cada escritura.
- **`fsync=off`.** Más rápido y capaz de corromper la base de datos en un corte. Inaceptable.

## Consecuencias

- (+) Las escrituras dejan de esperar al disco. Es lo que más se nota en el día a día.
- (-) En un corte de luz se pueden perder los últimos ~0,6 segundos de transacciones confirmadas. Sin corrupción: la base arranca consistente.
- (~) Se revisará con NVMe y SAI. Con los dos, el coste desaparece y quizá también la necesidad.
