# 0003. SnappyMail con tema propio, no un webmail propio

**Estado:** aceptada, sustituye a un webmail construido y retirado el mismo día

## Contexto

La app Mail de Nextcloud no avisa al instante. SnappyMail habla IMAP en vivo y se integra en la barra de Nextcloud, pero sus temas incluidos son de otra época. Se pidió algo oscuro, elegante y ordenado y, si podía ser, con todas las cuentas en una sola bandeja.

Se interpretó como "construye un webmail" y se construyó uno desde cero: bóveda cifrada, IMAP IDLE, bandeja unificada, atajos, pruebas. Funcionaba. No era lo que se quería: la petición era el aspecto, dentro de SnappyMail.

## Decisión

SnappyMail como webmail, con un tema propio (Atelier) que da el aspecto pedido. El webmail propio se retira con sus datos, su imagen y, más tarde, su código.

## Alternativas descartadas

- **Mantener el webmail propio.** Tenía bandeja unificada, que SnappyMail no tiene. Pero era otra aplicación que mantener, fuera de Nextcloud, y nadie la había pedido.
- **Roundcube con Elastic.** El más pulido de los clásicos, con modo oscuro de serie. Era cambiar de webmail por estética y perder la integración ya hecha.
- **Cypht.** Bandeja unificada, con la interfaz más austera de todas.

## Consecuencias

- (+) Una sola interfaz, la de Nextcloud, con el aspecto que se quería.
- (-) Sin bandeja unificada: cada cuenta se ve por separado.
- (-) Hay que comprobar el tema en cada actualización de SnappyMail.
- (~) Una tarde de trabajo tirada, y la lección de preguntar antes de resolver una ambigüedad hacia lo grande.
