# 0008. Secretos fuera del `compose.yaml`

**Estado:** aceptada

## Contexto

Las claves de Valkey, Postgres, el administrador y el túnel estaban en claro en los `compose.yaml`. Esos ficheros se muestran en Dockge, se copian como respaldo y se pegan para pedir ayuda. Dos secretos acabaron en una conversación exactamente así. Además, una misma contraseña se reutilizaba en al menos siete sitios.

## Decisión

Los secretos viven en ficheros con permisos `600` que los contenedores leen al arrancar. Nada en el `compose.yaml` ni en variables visibles. Una contraseña distinta para cada cosa. Las comprobaciones se hacen con el nombre de la variable o con un hash, nunca mostrando el valor.

## Alternativas descartadas

- **Docker Secrets con Swarm.** Correcto, y obliga a montar un Swarm de un solo nodo.
- **Un gestor de secretos externo.** Fuera de escala para una casa.

## Consecuencias

- (+) Un `compose.yaml` se puede enseñar sin miedo.
- (+) Rotar una clave es cambiar un fichero, no editar una pila.
- (-) Algunas imágenes solo leen variables de entorno y exigen un pequeño envoltorio para leer del fichero.
