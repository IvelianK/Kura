# 0005. Túnel saliente, cero puertos abiertos

**Estado:** aceptada

## Contexto

Algunos servicios tienen que ser accesibles desde fuera de casa. La forma clásica es abrir el 443 en el router y apuntar un DNS dinámico a la IP de casa.

## Decisión

Ningún puerto abierto en el router. Un túnel abre una conexión saliente hacia un proveedor de borde y el tráfico entra por ella hasta Caddy. Lo que no debe ser público (paneles de sistema, gestión de contenedores) solo se alcanza por una VPN de malla. Desde dentro de casa, AdGuard reescribe los dominios a la IP local para no salir a internet.

## Alternativas descartadas

- **Abrir el 443.** Expone la IP de casa y deja el NAS a un escaneo de distancia de cualquier bot.
- **Todo por VPN.** Lo más cerrado, pero obliga a cada dispositivo y a cada persona a llevar un cliente, y algunas cosas (compartir un álbum) dejan de ser posibles.

## Consecuencias

- (+) Ni IP ni puertos visibles. El borde filtra lo más burdo antes de que llegue a casa.
- (+) Certificados válidos también en local, porque Caddy los obtiene igual.
- (-) Dependencia de un tercero para la entrada pública. Si el túnel cae, desde fuera solo queda la VPN.
- (-) El túnel tiene que llegar a la red de cada aplicación que publica, o la aplicación existe y nadie llega. Pasó: ver [Tropiezos](../08-tropiezos.md#la-web-que-nadie-veía).
