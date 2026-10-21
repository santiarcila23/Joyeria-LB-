# Joyería LB

Tienda en línea en HTML, CSS y JavaScript puro (sin instalar nada). Catálogo por categorías, galería de varias fotos por producto, carrito que se guarda en el celular y pedido directo por WhatsApp.

## Estructura

```
index.html        Inicio: categorías + destacados
catalogo.html     Catálogo con filtro por categoría y buscador
css/estilos.css   Estilos (negro y dorado)
js/config.js      ⚙️ Número de WhatsApp, nombre y ciudad
js/productos.js   🛍️ Categorías y productos (aquí se edita el catálogo)
js/app.js         Lógica del carrito, galería y WhatsApp
img/productos/    Fotos de los productos
img/categorias/   Fotos de las tarjetas de categoría
```

## 1. Poner tu número de WhatsApp

En `js/config.js` cambia `whatsapp` por tu número con indicativo y sin `+` ni espacios:

```js
whatsapp: "573001234567",
```

## 2. Agregar o cambiar productos

1. Sube las fotos a `img/productos/<categoria>/` (JPG o WebP, ideal cuadradas de 800×800 px y menos de 300 KB).
2. En `js/productos.js` agrega un bloque así:

```js
{
  id: "d-023",                   // único, sin espacios
  nombre: "Dije Trébol",
  categoria: "dijes",            // brazaletes-caballero, brazaletes-dama, cadenas,
                                 // candongas, dijes, herrajes o topos
  precio: 48000,                 // sin puntos; null = "Consultar precio"
  descripcion: "Trébol de cuatro hojas con baño de oro.",
  imagenes: [
    "img/productos/dijes/dije-trebol-1.webp",
    "img/productos/dijes/dije-trebol-2.webp"
  ],
  destacado: true                // opcional: sale en el inicio
},
```

Todos los productos actuales tienen `precio: null`. Para ponerle precio a uno, busca su nombre en `js/productos.js` y cambia `null` por el valor (ej. `precio: 85000`). El carrito y el mensaje de WhatsApp suman solo los que tienen precio y marcan los demás como "precio a consultar".

> Ojo: los nombres de archivo distinguen mayúsculas en GitHub Pages (`Foto.JPG` ≠ `foto.jpg`).

## 3. Publicar con GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `joyeria-lb`).
2. Sube todo el contenido de esta carpeta (que `index.html` quede en la raíz):
   ```bash
   git init
   git add .
   git commit -m "Tienda Joyería LB"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/joyeria-lb.git
   git push -u origin main
   ```
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. En 1–2 minutos queda en `https://TU_USUARIO.github.io/joyeria-lb/`.

## Probar en tu computador

Abre `index.html` directamente, o mejor con un servidor local:

```bash
python -m http.server 8000
```

y entra a `http://localhost:8000`.
