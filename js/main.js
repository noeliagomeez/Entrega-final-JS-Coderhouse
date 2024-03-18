
const shopContent = document.getElementById("shopContent")
const verCarrito = document.getElementById("verCarrito")
const modalContainer = document.getElementById("modal-container")


//Si hay productos en el localstorage, el carrito mantendrá los productos aunque se refresque la página. En caso contrario, el carrito se visualizará vacío.
let carrito =  JSON.parse(localStorage.getItem("carrito")) || []


//Función asíncrona, capturo el array de mis objetos y accedo a ellos mediante "Fetch"

const getProducts = async () => {
    const response = await fetch("data.json")
    const data = await response.json()

    //Se crea las cards de los productos
    
    data.forEach((product)=> {
    let content = document.createElement("div");
    content.className = "card"
    content.innerHTML = `
    <img src="${product.img}">
    <h3>${product.nombre}</h3>
    <p class= "price">${product.precio}$</p>
    `;
    shopContent.append(content)
  
  //Añadir botón de comprar
    let comprar = document.createElement("button")
    comprar.innerText = "Comprar"
    comprar.className = "comprar"
  
    content.append(comprar)

    //Se crea evento para que aparezca la alerta cada vez que se hace click
    comprar.addEventListener("click", function() {
        // Mostrar alerta de Toastify
        Toastify({
            text: "Producto agregado al carrito correctamente",
            duration: 1500,
            gravity: "top",
            position: "right",
            stopOnFocus: false,
            style: {
                background: "linear-gradient(to right, #AC9EB8, #0F1D28)",
            },
        }).showToast();
    });
  
    
  //La cantidad del producto dentro del modal aumenta y no se multiplica el producto nuevamente. La cantidad aumenta una vez que uno ya se haya agregado.
    comprar.addEventListener("click", () => {
      const repeat = carrito.some((repeatProduct) => repeatProduct.id === product.id)
  
      if (repeat) {
          carrito.map((prod) => {
              if (prod.id === product.id) {
                  prod.cantidad++
              }
          })
      } else {
      carrito.push ({
          id: product.id,
          nombre: product.nombre,
          img: product.img,
          precio: product.precio,
          cantidad: product.cantidad,
      })
      }   
      saveLocal()
    }) 
  });

}

getProducts()


//LOCALSTORAGE  

//set item 
const saveLocal = () => {
    localStorage.setItem("carrito", JSON.stringify (carrito))
}

//Creación del header del modal (interior del carrito)

const pintarCarrito = () => {
    modalContainer.innerHTML = ""
    modalContainer.style.display = "flex"
    const modalHeader = document.createElement("div")
    modalHeader.className = "modal-header" 
    modalHeader.innerHTML = `
    <h1 class= "modal-header-title">Carrito</h1>
    `
    modalContainer.append(modalHeader)

    //Creacion de la "X" dentro del header del modal para poder cerrar la ventana
    const modalbutton = document.createElement("h1");
    modalbutton.innerText = "x";
    modalbutton.className = "modal-header-button";

    //Agrego evento de click al botón
    modalbutton.addEventListener("click", () => {
    modalContainer.style.display = "none";
    });

    modalHeader.append(modalbutton);

    //Se agrega los productos dentro del modal del carrito
    carrito.forEach((product) => {
    let carritoContent = document.createElement("div")
    carritoContent.className = "modal-content"
    carritoContent.innerHTML = `
    <img src="${product.img}">
    <h3> ${product.nombre}</h3>
    <p> ${product.precio}$</p>
    <span class="restar"> - </span> 
    <p> Cantidad: ${product.cantidad}</p>
    <span class="sumar"> + </span> 
    <p> Total: ${product.cantidad*product.precio}</p>
    <span class="delete-product"> ❌ </span>
    `
    modalContainer.append(carritoContent)

    //Le damos funcionalidad al botón de restar cantidades

    let restar = carritoContent.querySelector(".restar")

    restar.addEventListener("click", () => {
        if(product.cantidad !== 1) {
            product.cantidad--;
        }
        pintarCarrito()
        saveLocal()
    })

    //Le damos funcionalidad al botón de sumar cantidades

    let sumar = carritoContent.querySelector(".sumar")

    sumar.addEventListener("click", () => {
        product.cantidad++
        pintarCarrito()
        saveLocal()
    })

    // Botón de eliminar productos

    let eliminar = carritoContent.querySelector(".delete-product")

    eliminar.addEventListener ("click", () => {
        eliminarProducto(product.id)
    })
    })

    //Se realiza una sumatoria del total a pagar
    const total = carrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0)
    
    const totalBuying = document.createElement("div")
    totalBuying.className = "total-content"
    totalBuying.innerHTML = `Total a pagar: ${total} $`
    modalContainer.append(totalBuying)

    //Se agrega botón de finalizar compra dentro del modal
    
    const finalizarCompraBtn = document.createElement("button");
    finalizarCompraBtn.innerText = "Finalizar compra";
    finalizarCompraBtn.className = "finalizar-compra-btn";
    modalContainer.append(finalizarCompraBtn);

    finalizarCompraBtn.addEventListener("click", () => {
        Swal.fire({
            title: "¡Tu compra se ha realizado con éxito!",
            text: "Estás siendo redirigido al proceso de pago",
            icon: "success"
          });
    });

    // Creación del botón "Vaciar Carrito"

    const vaciarCarritoBtn = document.createElement("button");
    vaciarCarritoBtn.innerText = "Vaciar Carrito";
    vaciarCarritoBtn.className = "vaciar-carrito-btn";
    modalContainer.append(vaciarCarritoBtn);

    // Agregamos el evento click al botón "Vaciar Carrito"
    vaciarCarritoBtn.addEventListener("click", () => {

    //Se agrega alerta de confirmación 

    Swal.fire ({
        title: "¿Estás seguro que quieres vaciar el carrito?",
        showDenyButton: true,
        showCancelButton: true, 
        confirmButtonText: "Sí, vaciar el carrito",
        danyButtonText: "No, cancelar"

    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            saveLocal();
            pintarCarrito();
            Swal.fire("¡Carrito vaciado!", "", "success");
        } else if (result.isDenied) {
            Swal.fire ("Cancelado", "Tu carrito se mantiene igual :)", "info");
        }
    })
    
});

}  

verCarrito.addEventListener("click", pintarCarrito )

//Función para eliminar el producto
const eliminarProducto = (id) => {
    const foundId = carrito.find((element) => element.id === id)

    carrito = carrito.filter((carritoId) => {
        return carritoId !== foundId
    })
    saveLocal()
    pintarCarrito()
}