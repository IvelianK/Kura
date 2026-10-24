# 0009. Un solo lenguaje visual para todo

**Estado:** aceptada

## Contexto

Treinta y tantos servicios, cada uno con su aspecto. El panel era plano, con huecos y enlaces repetidos. El correo tenía temas de otra época. La sensación era de colección de herramientas, no de sistema.

## Decisión

Una sola paleta y una sola tipografía para lo que se usa a diario: fondo tinta, acento ámbar, serif en los títulos, cristal oscuro con borde fino. Aplicada como tema propio en SnappyMail (Atelier) y como CSS y JS inyectados en Homepage, sin tocar su código.

## Alternativas descartadas

- **Un panel propio desde cero.** Control total, y otra aplicación que mantener.
- **Dejar los aspectos de serie.** Cero mantenimiento, y la sensación de no tener un sistema.

## Consecuencias

- (+) Panel y correo parecen la misma herramienta.
- (+) Al ser CSS inyectado, se quita borrando dos ficheros.
- (-) Depende de la estructura de la interfaz de cada aplicación. Una actualización que cambie las clases puede romper detalles del diseño.
