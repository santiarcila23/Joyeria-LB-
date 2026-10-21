/* ============================================================
   JOYERÍA LB — lógica de la tienda
   (no necesitas editar este archivo para agregar productos)
   ============================================================ */
(function () {
  "use strict";

  const CLAVE_CARRITO = "joyerialb_carrito";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: TIENDA.moneda || "COP", maximumFractionDigits: 0,
  });
  const precio = (n) => formatoPrecio.format(n).replace(/\s/g, "");
  // Si un producto no tiene precio (null o 0) se muestra "Consultar precio"
  const tienePrecio = (p) => typeof p.precio === "number" && p.precio > 0;
  const textoPrecio = (p, cant = 1) => (tienePrecio(p) ? precio(p.precio * cant) : "Consultar precio");
  const nombreCategoria = (id) => (CATEGORIAS.find((c) => c.id === id) || {}).nombre || "";
  const buscarProducto = (id) => PRODUCTOS.find((p) => p.id === id);
  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Carrito (guardado en el navegador) ---------------- */
  let carrito = leerCarrito();

  function leerCarrito() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
      return datos.filter((i) => buscarProducto(i.id) && i.cantidad > 0);
    } catch (e) { return []; }
  }
  function guardarCarrito() {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)); } catch (e) {}
    pintarCarrito();
  }
  function agregar(id, cantidad = 1) {
    const item = carrito.find((i) => i.id === id);
    if (item) item.cantidad += cantidad;
    else carrito.push({ id, cantidad });
    guardarCarrito();
    const c = $("#contador");
    c.classList.remove("salto"); void c.offsetWidth; c.classList.add("salto");
    mostrarAviso(`✓ ${buscarProducto(id).nombre} agregado`);
  }
  function cambiarCantidad(id, delta) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) carrito = carrito.filter((i) => i.id !== id);
    guardarCarrito();
  }
  function quitar(id) { carrito = carrito.filter((i) => i.id !== id); guardarCarrito(); }
  const totalUnidades = () => carrito.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio = () => carrito.reduce((s, i) => { const p = buscarProducto(i.id); return s + (tienePrecio(p) ? p.precio * i.cantidad : 0); }, 0);
  const hayPorConsultar = () => carrito.some((i) => !tienePrecio(buscarProducto(i.id)));
  function textoTotal() {
    const t = totalPrecio();
    if (!hayPorConsultar()) return precio(t);
    return t > 0 ? `${precio(t)} + por confirmar` : "Por confirmar";
  }

  /* ---------------- Componentes compartidos ---------------- */
  function montarComponentes() {
    $("#componentes").innerHTML = `
      <div class="capa" id="capa"></div>

      <aside class="carrito" id="carrito" aria-label="Carrito de compras" aria-hidden="true">
        <div class="carrito-cab">
          <h2>Tu carrito</h2>
          <button class="cerrar" data-cerrar aria-label="Cerrar">×</button>
        </div>
        <div class="carrito-lista" id="carritoLista"></div>
        <div class="carrito-pie" id="carritoPie">
          <div class="carrito-total"><span>Total</span><strong id="carritoTotal">$0</strong></div>
          <input class="campo" id="clienteNombre" type="text" placeholder="Tu nombre (opcional)" autocomplete="name">
          <textarea class="campo" id="clienteNota" rows="2" placeholder="Nota: talla, letra del dije, dirección… (opcional)"></textarea>
          <a class="btn btn-wpp" id="btnWhatsapp" target="_blank" rel="noopener">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
            Enviar pedido por WhatsApp
          </a>
          <p class="nota-envio">Se abrirá WhatsApp con tu pedido listo para enviar.</p>
        </div>
      </aside>

      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-hidden="true">
        <span class="agarre"></span>
        <button class="cerrar" data-cerrar aria-label="Cerrar">×</button>
        <div class="modal-cuerpo">
          <div class="modal-media">
            <div class="galeria">
              <div class="galeria-slides" id="galeriaSlides"></div>
              <button class="galeria-flecha izq" id="flechaIzq" aria-label="Foto anterior">‹</button>
              <button class="galeria-flecha der" id="flechaDer" aria-label="Foto siguiente">›</button>
              <div class="galeria-puntos" id="galeriaPuntos"></div>
            </div>
            <div class="miniaturas" id="miniaturas"></div>
          </div>
          <div class="detalle">
            <span class="producto-cat" id="modalCat"></span>
            <h3 id="modalNombre"></h3>
            <p class="detalle-precio" id="modalPrecio"></p>
            <p class="detalle-desc" id="modalDesc"></p>
          </div>
        </div>
        <div class="modal-pie">
          <div class="cantidad-sel">
            <button id="menos" aria-label="Menos">−</button>
            <span id="modalCantidad">1</span>
            <button id="mas" aria-label="Más">+</button>
          </div>
          <button class="btn btn-oro" id="modalAgregar">Agregar al carrito</button>
        </div>
      </div>

      <div class="aviso" id="aviso" role="status" aria-live="polite"></div>`;

    $("#capa").addEventListener("click", cerrarTodo);
    $$("[data-cerrar]").forEach((b) => b.addEventListener("click", cerrarTodo));
    $("#abrirCarrito").addEventListener("click", abrirCarrito);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarTodo(); });

    // Acciones dentro del carrito
    $("#carritoLista").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-accion]");
      if (!b) return;
      const id = b.dataset.id;
      if (b.dataset.accion === "mas") cambiarCantidad(id, 1);
      if (b.dataset.accion === "menos") cambiarCantidad(id, -1);
      if (b.dataset.accion === "quitar") quitar(id);
      if (b.dataset.accion === "seguir") cerrarTodo();
    });
    ["clienteNombre", "clienteNota"].forEach((id) => $("#" + id).addEventListener("input", actualizarEnlaceWpp));
    $("#btnWhatsapp").addEventListener("click", (e) => { if (!carrito.length) e.preventDefault(); });

    // Modal: cantidad y agregar
    $("#menos").addEventListener("click", () => setCantidadModal(cantidadModal - 1));
    $("#mas").addEventListener("click", () => setCantidadModal(cantidadModal + 1));
    $("#modalAgregar").addEventListener("click", () => {
      agregar(productoAbierto.id, cantidadModal);
      cerrarTodo();
    });

    // Galería
    const slides = $("#galeriaSlides");
    let tick;
    slides.addEventListener("scroll", () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(() => marcarFoto(Math.round(slides.scrollLeft / slides.clientWidth)));
    }, { passive: true });
    $("#flechaIzq").addEventListener("click", () => irAFoto(fotoActual - 1));
    $("#flechaDer").addEventListener("click", () => irAFoto(fotoActual + 1));

    // Footer
    const fc = $("#footerCiudad"); if (fc) fc.textContent = TIENDA.ciudad || "";
    const fw = $("#footerWpp"); if (fw) fw.href = `https://wa.me/${TIENDA.whatsapp}`;
        // Instagram: acepta "@usuario", "usuario" o el link completo
    const ig = (TIENDA.instagram || "").trim();
    const fi = $("#footerIg");
    if (fi && ig) {
      const usuario = ig.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "");
      fi.href = `https://instagram.com/${usuario}`;
      $("#footerIgTxt").textContent = "@" + usuario;
      fi.hidden = false;
    }
  }

  /* ---------------- Bloqueo de scroll (incluye iPhone) ---------------- */
  let scrollGuardado = 0;
  function bloquearScroll() {
    if (document.body.classList.contains("bloqueado")) return;
    scrollGuardado = window.scrollY;
    Object.assign(document.body.style, { position: "fixed", top: `-${scrollGuardado}px`, left: "0", right: "0" });
    document.body.classList.add("bloqueado");
  }
  function liberarScroll() {
    if (!document.body.classList.contains("bloqueado")) return;
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "" });
    document.body.classList.remove("bloqueado");
    window.scrollTo(0, scrollGuardado);
  }

  function abrirCarrito() {
    cerrarModalSolo();
    $("#carrito").classList.add("abierta");
    $("#carrito").setAttribute("aria-hidden", "false");
    $("#capa").classList.add("abierta");
    bloquearScroll();
  }
  function cerrarModalSolo() {
    $("#modal").classList.remove("abierta");
    $("#modal").setAttribute("aria-hidden", "true");
  }
  function cerrarTodo() {
    cerrarModalSolo();
    $("#carrito").classList.remove("abierta");
    $("#carrito").setAttribute("aria-hidden", "true");
    $("#capa").classList.remove("abierta");
    liberarScroll();
  }

  /* ---------------- Pintar carrito ---------------- */
  function pintarCarrito() {
    const n = totalUnidades();
    const c = $("#contador");
    c.textContent = n;
    c.classList.toggle("visible", n > 0);

    const lista = $("#carritoLista");
    if (!lista) return;
    if (!carrito.length) {
      lista.innerHTML = `
        <div class="carrito-vacio">
          <p>Tu carrito está vacío.</p>
          ${document.body.dataset.page === "catalogo"
            ? `<button class="btn btn-borde" data-accion="seguir">Seguir viendo</button>`
            : `<a class="btn btn-borde" href="catalogo.html">Ir al catálogo</a>`}
        </div>`;
      $("#carritoPie").hidden = true;
      return;
    }
    $("#carritoPie").hidden = false;
    lista.innerHTML = carrito.map((i) => {
      const p = buscarProducto(i.id);
      return `
        <div class="item">
          <img src="${p.imagenes[0]}" alt="${escapar(p.nombre)}" loading="lazy">
          <div>
            <div class="item-nombre">${escapar(p.nombre)}</div>
            <div class="item-precio">${tienePrecio(p) ? precio(p.precio) + " c/u" : "Consultar precio"}</div>
            <div class="cantidad-sel">
              <button data-accion="menos" data-id="${p.id}" aria-label="Menos">−</button>
              <span>${i.cantidad}</span>
              <button data-accion="mas" data-id="${p.id}" aria-label="Más">+</button>
            </div>
          </div>
          <div class="item-der">
            <span class="item-sub">${tienePrecio(p) ? precio(p.precio * i.cantidad) : ""}</span>
            <button class="item-quitar" data-accion="quitar" data-id="${p.id}">Quitar</button>
          </div>
        </div>`;
    }).join("");
    $("#carritoTotal").textContent = textoTotal();
    $("#carritoTotal").classList.toggle("por-confirmar", hayPorConsultar());
    actualizarEnlaceWpp();
  }

  /* ---------------- Mensaje de WhatsApp ---------------- */
  function actualizarEnlaceWpp() {
    const nombre = ($("#clienteNombre").value || "").trim();
    const nota = ($("#clienteNota").value || "").trim();
    const lineas = carrito.map((i, idx) => {
      const p = buscarProducto(i.id);
      const valor = tienePrecio(p) ? precio(p.precio * i.cantidad) : "precio a consultar";
      return `${idx + 1}. ${p.nombre} [${nombreCategoria(p.categoria)}] (x${i.cantidad}) - ${valor}`;
    });
    let msg = `Hola ${TIENDA.nombre}, quiero hacer este pedido:\n\n${lineas.join("\n")}\n\n*Total: ${textoTotal()}*`;
    if (nombre) msg += `\n\nNombre: ${nombre}`;
    if (nota) msg += `\nNota: ${nota}`;
    $("#btnWhatsapp").href = `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------------- Aviso ---------------- */
  let timerAviso;
  function mostrarAviso(texto) {
    const a = $("#aviso");
    a.textContent = texto;
    a.classList.add("visible");
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => a.classList.remove("visible"), 1800);
  }

  /* ---------------- Modal de producto ---------------- */
  let productoAbierto = null, cantidadModal = 1, fotoActual = 0;

  function setCantidadModal(n) {
    cantidadModal = Math.max(1, Math.min(99, n));
    $("#modalCantidad").textContent = cantidadModal;
  }
  function abrirProducto(id) {
    const p = buscarProducto(id);
    if (!p) return;
    productoAbierto = p;
    setCantidadModal(1);
    $("#modalCat").textContent = nombreCategoria(p.categoria);
    $("#modalNombre").textContent = p.nombre;
    $("#modalPrecio").textContent = textoPrecio(p);
    $("#modalPrecio").classList.toggle("consultar", !tienePrecio(p));
    $("#modalDesc").textContent = p.descripcion;

    const varias = p.imagenes.length > 1;
    $("#galeriaSlides").innerHTML = p.imagenes.map((src, i) =>
      `<img src="${src}" alt="${escapar(p.nombre)} — foto ${i + 1}" ${i ? 'loading="lazy"' : ""} draggable="false">`).join("");
    $("#galeriaPuntos").innerHTML = varias ? p.imagenes.map((_, i) => `<button aria-label="Foto ${i + 1}" data-i="${i}"></button>`).join("") : "";
    $("#miniaturas").innerHTML = varias ? p.imagenes.map((src, i) => `<button data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${src}" alt=""></button>`).join("") : "";
    $$("#galeriaPuntos button, #miniaturas button").forEach((b) => b.addEventListener("click", () => irAFoto(+b.dataset.i)));
    $("#flechaIzq").hidden = $("#flechaDer").hidden = !varias;

    $("#carrito").classList.remove("abierta");
    $("#modal").classList.add("abierta");
    $("#modal").setAttribute("aria-hidden", "false");
    $("#capa").classList.add("abierta");
    bloquearScroll();
    $("#galeriaSlides").scrollLeft = 0;
    $(".modal-cuerpo").scrollTop = 0;
    marcarFoto(0);
  }
  function irAFoto(i) {
    const total = productoAbierto.imagenes.length;
    i = (i + total) % total;
    const s = $("#galeriaSlides");
    s.scrollTo({ left: i * s.clientWidth, behavior: "smooth" });
    marcarFoto(i);
  }
  function marcarFoto(i) {
    fotoActual = i;
    $$("#galeriaPuntos button").forEach((b, k) => b.classList.toggle("activo", k === i));
    $$("#miniaturas button").forEach((b, k) => b.classList.toggle("activo", k === i));
  }

  /* ---------------- Tarjetas ---------------- */
  function tarjetaProducto(p, idx = 0) {
    const fotos = p.imagenes.length;
    return `
      <article class="producto" style="animation-delay:${Math.min(idx, 8) * 40}ms">
        <button class="producto-img" data-abrir="${p.id}" aria-label="Ver ${escapar(p.nombre)}">
          <img src="${p.imagenes[0]}" alt="${escapar(p.nombre)}" loading="lazy">
          ${fotos > 1 ? `<span class="producto-fotos">${fotos} fotos</span>` : ""}
        </button>
        <div class="producto-info" data-abrir="${p.id}">
          <span class="producto-cat">${nombreCategoria(p.categoria)}</span>
          <span class="producto-nombre">${escapar(p.nombre)}</span>
          <span class="producto-precio${tienePrecio(p) ? "" : " consultar"}">${textoPrecio(p)}</span>
        </div>
        <button class="producto-agregar" data-agregar="${p.id}">Agregar</button>
      </article>`;
  }
  function activarTarjetas(contenedor) {
    contenedor.addEventListener("click", (e) => {
      const add = e.target.closest("[data-agregar]");
      if (add) {
        agregar(add.dataset.agregar);
        add.classList.add("agregado"); add.textContent = "✓ Agregado";
        setTimeout(() => { add.classList.remove("agregado"); add.textContent = "Agregar"; }, 1200);
        return;
      }
      const ver = e.target.closest("[data-abrir]");
      if (ver) abrirProducto(ver.dataset.abrir);
    });
  }

  /* ---------------- Página: Inicio ---------------- */
  function iniciarInicio() {
    $("#gridCategorias").innerHTML = CATEGORIAS.map((c) => `
      <a class="tarjeta-cat" href="catalogo.html?cat=${c.id}">
        <img src="${c.imagen}" alt="${escapar(c.nombre)}" loading="lazy">
        <div class="tarjeta-cat-info"><h3>${escapar(c.nombre)}</h3><p>${escapar(c.descripcion || "")}</p></div>
      </a>`).join("");
    const grid = $("#gridDestacados");
    const destacados = PRODUCTOS.filter((p) => p.destacado);
    grid.innerHTML = (destacados.length ? destacados : PRODUCTOS.slice(0, 4)).map(tarjetaProducto).join("");
    activarTarjetas(grid);
  }

  /* ---------------- Página: Catálogo ---------------- */
  function iniciarCatalogo() {
    const params = new URLSearchParams(location.search);
    let categoria = CATEGORIAS.some((c) => c.id === params.get("cat")) ? params.get("cat") : "todo";
    let texto = "";

    const filtro = $("#filtroCategorias");
    filtro.innerHTML =
      `<button class="chip-cat" data-cat="todo" role="tab"><span class="chip-cat-img"><span class="todo">LB</span></span>Todo</button>` +
      CATEGORIAS.map((c) => `
        <button class="chip-cat" data-cat="${c.id}" role="tab">
          <span class="chip-cat-img"><img src="${c.imagen}" alt=""></span>${escapar(c.nombre)}
        </button>`).join("");

    filtro.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      categoria = b.dataset.cat;
      const url = categoria === "todo" ? location.pathname : `${location.pathname}?cat=${categoria}`;
      history.replaceState(null, "", url);
      pintar();
      b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    const normalizar = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    $("#buscar").addEventListener("input", (e) => { texto = normalizar(e.target.value.trim()); pintar(); });

    const grid = $("#gridProductos");
    activarTarjetas(grid);

    function pintar() {
      $$(".chip-cat", filtro).forEach((b) => {
        const act = b.dataset.cat === categoria;
        b.classList.toggle("activo", act);
        b.setAttribute("aria-selected", act);
      });
      const lista = PRODUCTOS.filter((p) =>
        (categoria === "todo" || p.categoria === categoria) &&
        (!texto || normalizar(p.nombre + " " + p.descripcion).includes(texto)));
      $("#tituloCategoria").textContent = categoria === "todo" ? "Todo" : nombreCategoria(categoria);
      $("#cantidadResultados").textContent = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;
      grid.innerHTML = lista.map(tarjetaProducto).join("");
      $("#sinResultados").hidden = lista.length > 0;
    }
    pintar();
    const activo = $(".chip-cat.activo", filtro);
    if (activo && categoria !== "todo") activo.scrollIntoView({ inline: "center", block: "nearest" });
  }

  /* ---------------- Arranque ---------------- */
  montarComponentes();
  pintarCarrito();
  if (document.body.dataset.page === "inicio") iniciarInicio();
  if (document.body.dataset.page === "catalogo") iniciarCatalogo();

  // Si el carrito cambia en otra pestaña, se sincroniza
  window.addEventListener("storage", (e) => { if (e.key === CLAVE_CARRITO) { carrito = leerCarrito(); pintarCarrito(); } });
})();
