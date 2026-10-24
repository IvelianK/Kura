# 0006. Una red de Docker por aplicación

**Estado:** aceptada

## Contexto

Por defecto, muchas pilas acaban en la misma red de Docker. Ahí cualquier contenedor ve a cualquier otro: la web personal podría hablar con el Postgres de Nextcloud.

## Decisión

Cada aplicación tiene su red. Sus bases de datos y cachés solo están en ella y no publican puertos. Solo el proxy (Caddy) y el túnel se unen a varias redes. La web personal es la única a la que el túnel llega sin pasar por el proxy.

## Alternativas descartadas

- **Una red común.** Más simple, y un único contenedor comprometido lo ve todo.
- **Políticas de red con un orquestador.** Más finas, y fuera de escala para una sola máquina.

## Consecuencias

- (+) Un compromiso queda encerrado en su red.
- (+) Al retirar una aplicación, su red se va con ella y es fácil comprobar que no queda nada.
- (-) Cada aplicación nueva exige unir el proxy a su red, en caliente y en el `compose.yaml`. Si se olvida lo segundo, el siguiente reinicio la desconecta.
