# 📚 Guía paso a paso: poner en marcha «¿De qué va este libro?»

Tiempo: **20-30 minutos**, una sola vez. Hazlo desde un **ordenador** (mejor con Chrome o Edge). Después podrás editarlo todo desde el móvil.

Al terminar tendrás:
- **La web**: `https://dequevaestelibro.vercel.app` (o parecida)
- **El panel de edición**: `https://dequevaestelibro.vercel.app/admin`

Todo es **gratis**. Vas a usar dos servicios:
- **GitHub**: guarda los archivos de la web, como un Dropbox para webs.
- **Vercel**: publica la web en internet y la actualiza sola cada vez que guardas cambios.

> 📝 Ten abierto un **bloc de notas** durante la guía: vas a copiar 4 datos y te harán falta más adelante.

---

## PASO 1 · Descomprimir el proyecto

1. Descarga el archivo **`dequevaestelibro.zip`**.
2. Descomprímelo:
   - **Windows**: clic derecho sobre el ZIP → **Extraer todo…** → **Extraer**.
   - **Mac**: doble clic sobre el ZIP.
3. Se crea una carpeta **`dequevaestelibro`**. Ábrela. Dentro tienes que ver esto:

```
admin/   api/   assets/   data/   index.html   GUIA.md   README.md
```

✅ Si ves esas carpetas y archivos, sigue.

---

## PASO 2 · Crear tu cuenta de GitHub (si ya tienes, salta al paso 3)

1. Entra en **https://github.com/signup**
2. Escribe tu **email**. Usa un Gmail, Outlook o similar.
   > ⚠️ Si sale el error *«Email domain could not be verified»*, usa otro email (por ejemplo, un Gmail).
3. Pulsa **Continue**. Crea una **contraseña** → **Continue**.
4. Elige un **nombre de usuario** (*Username*), por ejemplo `aya-libros`. → **Continue**.
   > 📝 **Apunta tu nombre de usuario**: es el **DATO 1**.
5. Resuelve la verificación («no soy un robot») y pulsa **Create account**.
6. GitHub te envía un **código al email**. Escríbelo.
7. Si te hace preguntas de bienvenida, pulsa **Skip personalization** (abajo).

✅ Ya estás dentro de GitHub.

---

## PASO 3 · Crear el repositorio (la «carpeta» de la web en GitHub)

1. En GitHub, arriba a la derecha, pulsa el botón **＋** (al lado de tu foto) → **New repository**.
2. Rellena:
   - **Repository name**: `dequevaestelibro`
   - **Description**: (déjalo vacío)
   - Marca **Public** (pública).
   - **NO** actives *Add README*. Deja también *.gitignore* y *license* en **None**.
3. Pulsa el botón verde **Create repository**.

✅ Verás una página casi vacía que pone *«Quick setup»*.

---

## PASO 4 · Subir los archivos a GitHub

1. En esa página busca la frase *«…or create a new file or **uploading an existing file**»* y pulsa en **uploading an existing file**.
2. Abre en tu ordenador la carpeta **`dequevaestelibro`** del paso 1.
3. **Entra dentro** de la carpeta y **selecciona todo su contenido**:
   - Windows: `Ctrl + A`
   - Mac: `Cmd + A`
4. **Arrastra** todo lo seleccionado a la zona del navegador que pone *«Drag files here…»*.
   > ⚠️ Arrastra **lo que hay dentro** de la carpeta, **no la carpeta en sí** ni el ZIP.
5. Espera a que termine de cargar. Abajo verás la lista de archivos subiendo.
6. Baja hasta el final de la página y pulsa el botón verde **Commit changes**.
7. Comprueba que en la página del repositorio aparecen las carpetas **admin**, **api**, **assets** y **data** y el archivo **index.html**.

✅ Los archivos ya están en GitHub.

> 📝 **DATO 2**: tu repositorio es `TU_USUARIO/dequevaestelibro`, por ejemplo `aya-libros/dequevaestelibro`. Apúntalo exactamente así.

---

## PASO 5 · Publicar la web con Vercel

1. Entra en **https://vercel.com/signup**
2. Elige **Hobby** (*I'm working on personal projects*). Escribe tu nombre → **Continue**.
3. Pulsa **Continue with GitHub**. Se abre GitHub: pulsa **Authorize Vercel**.
   - Si te pide verificar el teléfono, hazlo.
4. Ya en Vercel, pulsa **Add New…** (arriba a la derecha) → **Project**.
5. En *«Import Git Repository»* verás tu lista de repositorios:
   - Si aparece **dequevaestelibro**, pulsa **Import** a su lado.
   - Si **no aparece**, pulsa **Install** o **Adjust GitHub App Permissions**. Se abre GitHub: elige **Only select repositories** → selecciona **dequevaestelibro** → **Install** (o **Save**). Vuelve a Vercel y pulsa **Import**.
6. En la pantalla *«Configure Project»*:
   - **Project Name**: `dequevaestelibro`
   - **Framework Preset**: **Other**
   - **Root Directory**: déjalo como está (`./`)
   - No toques nada más.
7. Pulsa **Deploy**. Espera unos 30 segundos.
8. Saldrá *«Congratulations!»*. Pulsa **Continue to Dashboard**.
9. En el panel del proyecto, en **Domains**, verás la dirección de tu web. Normalmente es `dequevaestelibro.vercel.app`; si ese nombre ya estaba cogido, será algo parecido, como `dequevaestelibro-abc.vercel.app`.
   > 📝 **DATO 3**: tu dirección web completa, por ejemplo `https://dequevaestelibro.vercel.app`.

✅ Abre esa dirección: **la web ya funciona** con 4 libros de ejemplo. Falta activar el panel de edición.

---

## PASO 6 · Crear el «acceso» del panel en GitHub (OAuth App)

Esto permite que el panel `/admin` te deje entrar con tu cuenta de GitHub.

1. Entra en **https://github.com/settings/developers**
   *(o bien: tu foto arriba a la derecha → **Settings** → en el menú de la izquierda, abajo del todo, **Developer settings** → **OAuth Apps**)*
2. Pulsa **New OAuth App** (o **Register a new application**).
3. Rellena **exactamente** (cambia la dirección por tu DATO 3):

| Campo | Qué poner |
|---|---|
| **Application name** | `dequevaestelibro` |
| **Homepage URL** | `https://dequevaestelibro.vercel.app` |
| **Application description** | (vacío) |
| **Authorization callback URL** | `https://dequevaestelibro.vercel.app/api/callback` |
| **Enable Device Flow** | sin marcar |

4. Pulsa **Register application**.
5. En la página que se abre:
   - Copia el **Client ID**, un código de letras y números. 📝 **DATO 4a**.
   - Pulsa **Generate a new client secret**. GitHub puede pedirte la contraseña o un código.
   - Copia **ya** el código que aparece. 📝 **DATO 4b**.
   > ⚠️ El *client secret* **solo se muestra una vez**. Si lo pierdes, genera otro. **No se lo enseñes a nadie.**

✅ Ya tienes los datos de acceso.

---

## PASO 7 · Poner los datos en Vercel

1. Vuelve a **Vercel** → entra en tu proyecto **dequevaestelibro**.
2. Arriba pulsa la pestaña **Settings**.
3. En el menú de la izquierda pulsa **Environment Variables**.
4. Añade estas **3 variables**, una a una. En cada una: escribe el **Key**, pega el **Value**, deja marcados todos los entornos (*Production, Preview, Development*) y pulsa **Save**.

| Key (escríbelo tal cual) | Value |
|---|---|
| `GITHUB_CLIENT_ID` | el **DATO 4a** (Client ID) |
| `GITHUB_CLIENT_SECRET` | el **DATO 4b** (Client secret) |
| `GITHUB_REPO` | el **DATO 2**, por ejemplo `aya-libros/dequevaestelibro` |

> ⚠️ Revisa que no se cuelen espacios al principio o al final al pegar.

5. **Muy importante**: para que se apliquen, vuelve a publicar:
   - Arriba pulsa la pestaña **Deployments**.
   - En la primera fila (la más reciente), pulsa los **tres puntos ⋯** de la derecha → **Redeploy** → otra vez **Redeploy**.
   - Espera a que ponga **Ready** (unos 30 segundos).

✅ El panel ya está activado.

---

## PASO 8 · Entrar al panel y hacer la primera prueba

1. Abre `https://dequevaestelibro.vercel.app/admin` (con tu DATO 3).
2. Pulsa **Entrar con GitHub**. GitHub te pedirá **Authorize**: acepta.
3. Vuelves al panel. Verás 4 pestañas:
   - **Libros**: añadir, editar, borrar y destacar (⭐).
   - **Temáticas**: crear, ordenar (↑↓), color, icono e imagen.
   - **Ajustes**: textos de la cabecera, **redes sociales**, número de destacados, días de «NUEVO» y libros en «Últimos subidos».
   - **Estética**: colores, tipografía, fondo, estilos…
4. Prueba esto:
   - Ve a **Ajustes** y pega el enlace de tu **YouTube** y tu **Instagram**.
   - Pulsa **👁 Vista previa** (arriba): se abre la web con tus cambios **sin publicar** todavía.
   - Pulsa **Publicar** (botón verde).
   - Espera **1-2 minutos** y recarga tu web: ¡ya están tus redes!

✅ **¡Terminado!**

---

## Cómo añadir un libro (día a día)

1. Panel → **Libros** → **+ Nuevo libro**.
2. Rellena:
   - **Título** y **Autor**.
   - **Temática**: elígela en el desplegable, o crea una nueva desde ahí mismo.
   - **Portada**: pulsa **📷 Subir imagen**. Desde el móvil puedes hacer una foto o elegir una de la galería.
   - **Sinopsis**.
   - **Enlace de YouTube**: al pegarlo aparece la miniatura del vídeo para que compruebes que es el correcto.
   - **Enlace de Amazon**: si usas Amazon Afiliados, pega tu enlace de afiliado.
   - **Fecha de subida**: se pone sola con la fecha de hoy.
   - **Destacado ⭐** y su texto, si quieres.
3. **Guardar** → y cuando tengas todo, **Publicar**.

> 💡 Puedes hacer varios cambios seguidos y publicar todo de una vez. El botón te dice cuántos cambios tienes pendientes.

---

## Usar el panel desde el móvil

1. Abre `https://dequevaestelibro.vercel.app/admin` en el móvil y entra con GitHub (solo la primera vez).
2. Añádelo a la pantalla de inicio para tenerlo como una app:
   - **iPhone (Safari)**: botón **Compartir** (cuadrado con flecha) → **Añadir a pantalla de inicio**.
   - **Android (Chrome)**: menú **⋮** → **Añadir a pantalla de inicio**.

---

## Poner la web en tus redes

Copia tu dirección (DATO 3) y pégala en:
- **Instagram**: Editar perfil → **Enlaces** → Añadir enlace externo.
- **YouTube**: Personalizar canal → **Información básica** → **Enlaces**.
- En la descripción de cada vídeo.

---

## Si algo falla

| Qué ves | Qué hacer |
|---|---|
| Error **404** al abrir la web o `/admin` | Los archivos no se subieron bien. En GitHub deben verse las carpetas `admin`, `api`, `assets` y `data` en la página principal del repositorio. Repite el paso 4. |
| *«The redirect_uri is not associated with this application»* | La **Authorization callback URL** del paso 6 no coincide con tu web. Debe ser tu DATO 3 + `/api/callback`. Entra siempre por la dirección principal (DATO 3). |
| *«Falta la variable…»* o *«No encuentro el repositorio»* | Revisa el paso 7: nombres de las variables, `GITHUB_REPO` bien escrito, y que hiciste el **Redeploy**. |
| *«Tu cuenta no tiene permiso»* | Estás entrando con otra cuenta de GitHub. Cierra sesión en github.com y entra con la tuya. |
| Publico pero no veo los cambios | Espera 2 minutos y recarga. En Vercel → **Deployments** puedes ver si está *Building* (publicando), *Ready* (listo) o *Error*. |
| La portada por ISBN no aparece o sale en inglés | Mejor sube tú la imagen con **📷 Subir imagen**. |
| *«Tu sesión ha caducado»* | Vuelve a pulsar **Entrar con GitHub**. |

---

## Seguridad

- Solo **tu cuenta de GitHub** puede publicar cambios. Si otra persona entra al panel, no podrá guardar nada.
- Si alguna vez quieres quitar el acceso: GitHub → foto → **Settings** → **Applications** → **Authorized OAuth Apps** → **dequevaestelibro** → **Revoke**.
- Nunca compartas el **Client secret**.

---

## Dominio propio (opcional, más adelante)

Si algún día compras un dominio (por ejemplo `dequevaestelibro.com`, unos 10-15 €/año):
1. Añádelo en Vercel → tu proyecto → **Settings** → **Domains**.
2. En GitHub, cambia las dos URLs del paso 6 por el nuevo dominio.
