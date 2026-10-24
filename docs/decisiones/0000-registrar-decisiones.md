# 0000. Registrar las decisiones

**Estado:** aceptada

## Contexto

En un servidor doméstico las decisiones se toman un domingo por la tarde y se olvidan el lunes. Seis meses después, nadie (yo incluido) recuerda por qué Postgres tiene `synchronous_commit=off` o por qué SnappyMail lleva un parche. Y lo que no se recuerda, se deshace sin querer.

## Decisión

Cada decisión que cambie cómo funciona el sistema, o que sea difícil de deshacer, se escribe en un fichero corto: contexto, decisión, alternativas descartadas y consecuencias.

## Consecuencias

- (+) Antes de cambiar algo, se puede leer por qué está así.
- (+) Obliga a escribir las alternativas descartadas, que es donde suele estar el razonamiento de verdad.
- (-) Unos minutos más por decisión.
