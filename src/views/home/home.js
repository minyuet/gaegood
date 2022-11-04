import { addCommas } from "/useful-functions.js";

const cards = document.querySelector(".cards");
const cardCategories = document.querySelectorAll(".nav-item");

fetch("/api/products")
  .then((res) => {
    return res.json();
  })
  .then((productList) => {
    const createCard = (item) => {
      return `<div class="card ${item.category}">
      <a href='/products/detail/${item._id}'>
        <img src="${item.smallImageURL}" class="card-img-top" alt="${
        item.name
      }" />
        <div class="card-body">
        <div class="card-body">${item.category}</div>
        <div class="card-text card-text-title">${item.name}</div>
        <div class="card-text card-spec">
          ${item.shortDesc}
        </div>
        <div class="card-text">${addCommas(item.price)}</div>
      </a>
      </div>
    </div>`;
    };
    productList.forEach((product) => {
      const newCard = createCard(product);
      cards.innerHTML += newCard;
    });
  });

cardCategories.forEach((cardCategory) =>
  cardCategory.addEventListener("click", (e) => {
    const eleValue = e.target;
    //eleValue.style.display = "block";
    alert(`${eleValue}를 클릭햇다!`);
  })
);
