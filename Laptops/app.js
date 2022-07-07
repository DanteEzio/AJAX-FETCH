let data;

//Aqui se cargan los productos y se lee nuestro sitio web
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  //Aqui estamos generando una condición para poder tener permanencia de información al recargar la página y que no se pierdan nuestros objetos del carrito
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    mostrarCarrito();
  }
});

// Esta función nos ayuda a poder leer nuestro archivo JSON
const fetchData = async () => {
  try {
    if (localStorage.getItem("data")) {
      data = JSON.parse(localStorage.getItem("data"));
    } else {
      const res = await fetch("api.json");
      data = await res.json();
    }
    // console.log(data)
    mostrarProductos(data);
    detectarBotones(data);
  } catch (error) {
    console.log(error);
  }
};

const contenedorProductos = document.querySelector("#contenedorLaptops");
const bloquear = document.querySelector(".agregarCarrito");

const mostrarProductos = () => {
  let cards = " ";

  data.forEach((item) => {
    cards = `
      <div class="col">
              <div class="card">
                <a href="">
                  <img
                  src="${item.img}"
                  class="card-img-top"
                  alt="..."
                  style="width: 100%; height: 250px"
                />
                </a>
                <div class="card-body">
                  <a href="">
                    <h5 class="card-title">
                      ${item.descripcion}
                    </h5>
                  </a>
                  <p class="text-muted">${item.sku}</p>
                  <h6><s>$${item.pReal.toLocaleString()} MXN</s></h6>
                  <h6>$${item.pDescuento.toLocaleString()} MXN</h6>
                  <p>Disponibles: ${item.stock}pzs.</p>
                  <button type="button" class="btn btn-secondary agregarCarrito" id=boton${
                    item.id
                  }>
                    Añadir al carrito <i class="fa-solid fa-cart-shopping"></i>
                  </button>
                </div>
              </div>
      </div>
    `;

    contenedorProductos.innerHTML += cards;

  });
};

const alertAgregar = (mensaje) => {
  swal.fire({
    // position: "bottom-end",
    showConfirmButtom: true,
    // toast: true,
    timer: 2000,
    // timerProgressBar: true,
    title: mensaje,
    // text: "Pronto nos pondremos en contacto con usted!",
    icon: "success",
    confirmButtonText: "Continue",
    confirmButtonColor: "#76b900",
    background: "#1a1a1ad2",
    backdrop: "#75b90030",
    color: "#eee",
    // width: "25em",
    // textContent: "uppercase",
  });
};

//Aqui creamos un carrito de objetos para que sea mas sencilla la manipulacion de las cantidades
let carrito = {};

const detectarBotones = () => {
  const botones = document.querySelectorAll(".card-body button");
  // console.log(botones)


  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log(`Se selecciono ${btn.id}`);
      const producto = data.find((item) => `boton${item.id}` == btn.id);
      console.log(producto);

      // alert(`Se agrego ${producto.nombre} al carrito`);

      if (producto.cantidad >= producto.stock) {
        return sinStock("Sin Stock Adicional!");
      }


      // Aquí estamos agregando el atributo cantidad, que sería la cantidad de productos que estaría comprando el usuario
      producto.cantidad = 1;

      //Aqui estamos haciendo nuestra condicion donde mencionamos que si ya existe el producto no lo duplique, únicamente incremente la cantidad
      if (carrito.hasOwnProperty(producto.id)) {
        // console.log("existe");
        producto.cantidad = carrito[producto.id].cantidad + 1;
      }
      alertAgregar(`Se agrego ${producto.nombre} al carrito`);

      // *** Esto es lo mismo que lo de arriba solo que con operador TERNARIO ***
      // carrito.hasOwnProperty(producto.id)
      //   ? (producto.cantidad = carrito[producto.id].cantidad + 1)
      //   : false;
      //Indicamos su índice y agregamos los elemento del producto, en pocas palabras estamos reemplazando el elemento ya creado y solo se le agrega la cantidad inicializada (*** Aqui estamos utilizando spread ***)
      carrito[producto.id] = { ...producto };
      // console.log(carrito);

      mostrarCarrito();
    });

    //Aquí estamos diciendo que si no hay mas stock en existencia deshabilite el boton para comprar
    const producto1 = data.find((item) => `boton${item.id}` == btn.id);
    if (producto1.stock == 0) {
      return (btn.disabled = true);
    }
  });
};

// Mostrar Carrito-1
const pAgregados = document.querySelector("#pAgregados");
const mostrarCarrito = () => {
  pAgregados.innerHTML = " ";

  const template = document.querySelector("#template-carrito").content;
  const fragment = document.createDocumentFragment();

  //Aqui estamos transformando nuestra lista de objetos en un ARRAY
  Object.values(carrito).forEach((producto) => {
    // console.log(producto)

    template.querySelector(".card-img-top").setAttribute("src", producto.img);
    template.querySelectorAll("td")[1].textContent = producto.cantidad;
    // template.querySelectorAll("td")[1].textContent = producto.nombre
    template.querySelectorAll("td")[3].textContent = `$${(
      producto.pDescuento * producto.cantidad
    ).toLocaleString()} MXN`;

    //botones
    template.querySelector(".incrementar").dataset.id = producto.id;
    template.querySelector(".decrementar").dataset.id = producto.id;
    template.querySelector(".eliminar").dataset.id = producto.id;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });

  pAgregados.appendChild(fragment);

  mostrarFooterCarrito();
  accionBotones();

  localStorage.setItem("carrito", JSON.stringify(carrito));
};

const footerCarrito = document.querySelector("#footerCarrito");
const contadorCarrito = document.querySelector("#contadorCar");
const botonesProcesar = document.querySelector(".botonesProcesar");
//Esta función nos muestra el footer del carrito (cantidad total y costo total)
const mostrarFooterCarrito = () => {
  footerCarrito.innerHTML = " ";
  contadorCarrito.innerHTML = " ";

  if (Object.keys(carrito).length === 0) {
    pAgregados.innerHTML = `
    <th scope="row" colspan="4">Carrito vacío</th>
    `;

    contadorCarrito.innerHTML = `
      <button
                    id="open"
                    class="nav-link text-body btn btn-primary"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasRight"
                    aria-controls="offcanvasRight"
                  >
                    <i class="bi bi-cart fa-lg"></i
                    ><span id="contador-carrito">0</span>
    `;

    // Aquí estamos ocultando los botones ("vaciar y procesar")
    document.getElementById("vaciar-carrito").style.display = "none";
    document.getElementById("procesar-carrito").style.display = "none";

    return;
  }

  //// Aquí estamos mostrando nuevamente los botones ("vaciar y procesar")
  document.getElementById("vaciar-carrito").style.display = "";
  document.getElementById("procesar-carrito").style.display = "";

  const template = document.querySelector("#templateFooterCarrito").content;
  const fragment = document.createDocumentFragment();

  // Este segundo apartado corresponde al contador del carrito
  const template2 = document.querySelector("#templateContador").content;
  const fragment2 = document.createDocumentFragment();

  //En este apartado necesitaremos sumar la cantidad total de los productos y el costo total
  const cTotal = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const cTotal2 = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const pTotal = Object.values(carrito).reduce(
    (acc, { cantidad, pDescuento }) => acc + cantidad * pDescuento,
    0
  );
  // console.log(pTotal)

  template.querySelectorAll("th")[1].textContent = cTotal;
  template.querySelectorAll(
    "th"
  )[3].textContent = `$${pTotal.toLocaleString()} MXN`;

  const clone = template.cloneNode(true);
  fragment.appendChild(clone);

  footerCarrito.appendChild(fragment);

  //Este apartado sirve para el contador del carrito
  template2.querySelector("#contador-carrito").textContent = cTotal2;

  const clone2 = template2.cloneNode(true);
  fragment2.appendChild(clone2);

  contadorCarrito.appendChild(fragment2); //Aqui termina la parte del Contador Carrito

  //Esta función nos permite vaciar el carrito de compras
  const botonVaciarC = document.querySelector("#vaciar-carrito");
  botonVaciarC.addEventListener("click", () => {
    alertEliminar(`Se limpio el carrito de compras`);

    Object.values(carrito).forEach((producto) => {
      let limpiar = data.find((item) => item.id == producto.id);

      limpiar.cantidad = 0;
    });
    carrito = {};

    mostrarCarrito();
  });

  //Esta función nos permite procesar la compra
  const botonProcesarC = document.querySelector("#procesar-carrito");
  botonProcesarC.addEventListener("click", () => {
    console.log("procesando...");
    Object.values(carrito).forEach((producto) => {
      let bProcesar = data.find((item) => item.id == producto.id);

      console.log(bProcesar);
      bProcesar.stock = bProcesar.stock - bProcesar.cantidad;
      bProcesar.cantidad = 0;
    });
    // console.log(data)
    alertProcesar(
      "Felicidades!! Su compra se realizó de manera exitosa, pronto nos pondremos en contacto con usted."
    );
    carrito = {};

    contenedorProductos.innerHTML = "";
    mostrarProductos();
    detectarBotones();
    mostrarCarrito();

    localStorage.setItem("data", JSON.stringify(data));
  });
};

const alertEliminar = (mensaje) => {
  swal.fire({
    position: "bottom-end",
    showConfirmButtom: true,
    // toast: true,
    timer: 3000,
    // timerProgressBar: true,
    // title: mensaje,
    text: mensaje,
    icon: "success",
    confirmButtonText: "Ok",
    background: "#75b90070",
    // backdrop: "#75b90011",
    width: "24em",
    color: "#eee",
  });
};

const sinStock = (mensaje) => {
  swal.fire({
    // position: "bottom-end",
    showConfirmButtom: true,
    // toast: true,
    timer: 3000,
    // timerProgressBar: true,
    title: mensaje,
    // text: mensaje,
    icon: "warning",
    confirmButtonText: "Ok",
    background: "#b90c00a9",
    // backdrop: "#75b90011",
    // width: "24em",
    color: "#eee",
  });
};

accionBotones = () => {
  const botonesAgregar = document.querySelectorAll(".incrementar");
  const botonesEliminar = document.querySelectorAll(".decrementar");
  const botonesVaciar = document.querySelectorAll(".eliminar");

  botonesVaciar.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log("Se elimino el item");
      const producto = carrito[btn.dataset.id];
      delete carrito[btn.dataset.id];
      alertEliminar(`Se elimino ${producto.nombre}`);
      let pCantidad = data.find((item) => item.id == producto.id);
      // console.log(pCantidad);
      pCantidad.cantidad = 0;
      // console.log(producto);
      mostrarCarrito();
    });
  });

  botonesAgregar.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log("agregando...")
      const producto = carrito[btn.dataset.id];
      // (*** Aqui estamos utilizando spread ***)
      if (producto.stock > producto.cantidad) {
        producto.cantidad++;
        carrito[btn.dataset.id] = { ...producto };
      } else {
        sinStock("Sin Stock Adicional!");
      }
      mostrarCarrito();
    });
  });

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", () => {
      // console.log("Eliminando...");
      const producto = carrito[btn.dataset.id];
      producto.cantidad--;
      if (producto.cantidad === 0) {
        delete carrito[btn.dataset.id];
        alertEliminar(`Se elimino ${producto.nombre}`);
        mostrarCarrito();
      } else {
        // (*** Aqui estamos utilizando spread ***)
        carrito[btn.dataset.id] = { ...producto };
        mostrarCarrito();
      }
      let pCantidad = data.find((item) => item.id == producto.id);
      console.log(pCantidad);
      pCantidad.cantidad = 0;
    });
  });
};

const alertProcesar = (mensaje) => {
  swal.fire({
    // position: "bottom-end",
    showConfirmButtom: true,
    // toast: true,
    timer: 5000,
    // timerProgressBar: true,
    // title: mensaje,
    text: mensaje,
    icon: "success",
    confirmButtonText: "Ok",
    background: "#75b900ab",
    // backdrop: "#75b90011",
    // width: "24em",
    color: "#eee",
  });
};
