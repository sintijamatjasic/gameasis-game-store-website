//sidebar menu button open & close

const navIcon = document.querySelector(".nav-icon");
const menu = document.querySelector(".menu");
const navLinks = document.querySelector(".nav-links");

navIcon.addEventListener("click", function () {
  const isMenuOpen =
    menu.classList.contains("transparentBcgg") &&
    navLinks.classList.contains("show-menu");

  if (isMenuOpen) {
    menu.classList.remove("transparentBcgg");
    navLinks.classList.remove("show-menu");
  } else {
    menu.classList.add("transparentBcgg");
    navLinks.classList.add("show-menu");
  }
});

//vars

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart

let cart = [];

//buttons
let buttonsDOM = [];

//getting products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { name, price, category } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image;
        return { name, price, id, image, category };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// displaying products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <!--single product start-->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="product" class="product-img" />
          <button class="bag-btn" data-id=${product.id}>
            <i class="bx bxs-cart"></i>
          </button>
        </div>
        <h3>${product.name}</h3>
        <h4>${product.price}€</h4>
      </article>
      <!--single product end-->
        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.disabled = true;
        //get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //add product to the cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.image} alt="product" />
            <div>
              <h4>${item.name}</h4>
              <h5>${item.price}€</h5>
              <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            <div class="amount">
              <i class="bx bx-chevron-up" data-id=${item.id}></i>
              <p class="item-amount" ${item.amount}>1</p>
              <i class="bx bx-chevron-down" data-id=${item.id}></i>
            </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("bx-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("bx-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="bx bxs-cart"></i>`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();

  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

//checkout alert message

const checkoutBtn = document.querySelector(".checkout-btn");

checkoutBtn.addEventListener("click", () => {
  cartContent.children.length > 0
    ? alert(`Thank you for your order!`)
    : alert(`Your cart is empty!`);
});

//contact page - send button alert

const sendBtn = document.querySelector(".contact-form-btn");

sendBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const contName = document.getElementById("contact-name").value;
  const contEmail = document.getElementById("contact-email").value;
  const contPhone = document.getElementById("contact-phone").value;
  const contMessage = document.getElementById("contact-msg").value;

  if (
    contName.trim() === "" ||
    contEmail.trim() === "" ||
    contPhone.trim() === "" ||
    contMessage.trim() === ""
  ) {
    alert(`Please fill out all information.`);
  } else {
    alert(`Thank you for your message!`);
  }
});
