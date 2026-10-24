# Política de seguridad

## Qué cubre

| Parte | Cubierta |
|---|---|
| Demo (`demo/`) | Sí |
| Paquete de despliegue (`deploy/`, imagen `ghcr.io/iveliank/kura-docs-demo`) | Sí |
| Workflows de GitHub Actions (`.github/`) | Sí |
| Documentación (`docs/`, `README.md`) | Solo si expone un dato que no debería ser público |

Solo se mantiene la última versión publicada y la imagen `latest`.

## Cómo informar de una vulnerabilidad

No abras una issue pública. Usa el reporte privado de GitHub: pestaña **Security** del repositorio, **Report a vulnerability**.

Incluye qué parte está afectada, cómo reproducirlo y el impacto que ves. Recibirás respuesta en un plazo de 7 días y, si se confirma, una corrección o un plan para corregirlo en 30 días como máximo. Se te citará en la corrección si lo deseas.

## Fuera de alcance

- La demo usa datos inventados y no tiene backend, cuentas ni llamadas de red: no hay datos reales que extraer de ella.
- Que la demo se pueda incrustar en otra página cuando se sirve desde GitHub Pages, que no permite cabeceras propias. La imagen de contenedor lo impide con `frame-ancestors 'none'`.
