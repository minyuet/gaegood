import { addCommas } from "/useful-functions.js";
import { main } from "/main.js";
const { loggedInUser } = await main();
import {
  createOderTable,
  createUserTable,
  createCategoryTable,
  createProductTable,
} from "./user-admin-module.js";

const mainTag = document.getElementById("main__container");

const adminPageList = document.querySelectorAll(
  ".admin__page__list > button"
);

const adminBtnOder = document.querySelector(".btn__admin__oder");
const adminBtnUser = document.querySelector(".btn__admin__user");
const adminBtnCategory = document.querySelector(".btn__admin__addCategory");
const adminBtnadddProduct = document.querySelector(".btn__admin__addProduct");

const oderAdmin = [
  "주문관리",
  "주문자",
  "주문정보",
  "총액(원)",
  "상태관리",
  "취소",
];
const userAdmin = ["가입날짜", "이메일", "이름", "권한", "관리"];
const categoryAdmin = [
  "생성날짜",
  "카테고리 이름",
  "수정날짜",
  "수정",
  "삭제",
];
const productAdmin = [
  "생성날짜",
  "이름",
  "카테고리",
  "가격",
  "재고수량",
  "수정",
  "삭제",
];

function compareEnglish(lsName) {
  if (lsName === "주문관리") return "oder__management";
  else if (lsName === "회원관리") return "user__management";
  else if (lsName === "카테고리 관리") return "add__category";
  return "add__product";
}

for (let i = 0; i < adminPageList.length - 2; i++) {
  const listBtn = adminPageList[i];
  listBtn.addEventListener("click", (element) => {
    //지금 table이 있는지 확인하고 있다면 다 지우기
    const currentTable = document.querySelector(".bd-example");
    if (currentTable) currentTable.remove();

    const listName = adminPageList[i].innerText;
    const listNameEn = compareEnglish(listName);

    const newHtml = document.createElement("div");
    newHtml.className = `bd-example ${listNameEn}`;
    if (listName === "주문관리") {
      document.querySelector(".btn__admin__addCategory").style =
        "display:none";
      document.querySelector(".btn__admin__addProduct").style =
        "display:none";
      fetch("/api/orders")
        .then((res) => res.json())
        .then((datas) => {
          console.log(datas);
          const newDatas = datas.map((data) => {
            return {
              _id: data._id,
              date: data.createdAt.slice(0, 10),
              name: data.recipientName,
              products: data.productList.map((data) => data.name),
              total: Number(data.totalAmount).toLocaleString(),
              shopStatus: data.shippingStatus,
            };
          });
          return newDatas;
        })
        .then((newDatas) => {
          console.log(newDatas);
          newHtml.appendChild(createOderTable(oderAdmin, newDatas));
          mainTag.append(newHtml);
        })
        .then(() => {
          oderManagementEdit();
          oderManagementDelete();
        });
    } else if (listName === "회원관리") {
      document.querySelector(".btn__admin__addCategory").style =
        "display:none";
      document.querySelector(".btn__admin__addProduct").style =
        "display:none";
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          const newData = data.map((e) => {
            return {
              _id: e._id,
              date: e.createdAt.slice(0, 10),
              name: e.name,
              email: e.email,
              role: e.role,
            };
          });
          return newData;
        })
      .then((newData) => {
        console.log((newData));
        newHtml.appendChild(createUserTable(userAdmin, newData));
        mainTag.append(newHtml);
      })
      // .then(() => {
      //   oderManagementEdit();
      //   oderManagementDelete();
      // });
    } else if (listName === "카테고리 관리") {
      //상품추가와 카테고리추가 없애기
      document.querySelector(".btn__admin__addCategory").style =
        "display:inline";
      document.querySelector(".btn__admin__addProduct").style =
        "display:none";

      fetch("/api/categories")
        .then((res) => res.json())
        .then((datas) => {
          const newDatas = datas.map((data) => {
            return {
              _id: data._id,
              date: data.createdAt.slice(0, 10),
              name: data.name,
              updateDate: data.updatedAt.slice(0, 10),
            };
          });
          return newDatas;
        })
        .then((newDatas) => {
          newHtml.appendChild(createCategoryTable(categoryAdmin, newDatas));
          mainTag.append(newHtml);
        })
        .then(() => {
          categoryManagementCreate();
          categoryManagementEdit();
          categoryManagementDelete();
        });
    } else {
      //상품추가와 카테고리추가 없애기
      document.querySelector(".btn__admin__addCategory").style =
        "display:none";
      document.querySelector(".btn__admin__addProduct").style =
        "display:inline";
      newHtml.innerHTML = innerAddProduct(listName);
    }
  });
}

//============ 주문관련 =====================
function oderManagementEdit() {
  const editBtns = document.querySelectorAll(".dropdown-item");
  //버튼클릭 => 배송준비 => 랜더링화면바꾸기 => fetch 수정 =>
  for (let count = 0; count < editBtns.length; count++) {
    editBtns[count].addEventListener("click", (e) => {
      //아래 기능이 없으면 배송상태가 바뀌면 최상단으로 화면이 이동한다
      e.preventDefault();
      const btnValue = e.target.text;
      const btnId =
        e.target.parentElement.parentElement.parentElement.parentElement
          .parentElement.id;
      //배송상태가 바뀐 값(배송중 => 배송완료)으로 현재 버튼이 배송완료 바뀌는 기능
      e.target.parentElement.parentElement.parentElement.querySelector(
        "a"
      ).innerText = `${btnValue}`;
      fetch(`http://localhost:5000/api/orders/${btnId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingStatus: `${btnValue}`,
        }),
      })
        .then((res) => res.json())
        .then((alt) => alert(alt.shippingStatus));
    });
  }
}

function oderManagementDelete() {
  const deleteBtns = document.querySelectorAll(".btn__delete");
  for (let count = 0; count < deleteBtns.length; count++) {
    deleteBtns[count].addEventListener("click", (e) => {
      const btnId = e.target.parentElement.parentElement.id;
      document.getElementById(`${btnId}`).remove();
      fetch(`http://localhost:5000/api/orders/${btnId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((alt) => alert(alt));
    });
  }
}

//============== 카테고리관련 ===============
function categoryManagementEdit() {
  const editCategoryBtns = document.querySelectorAll(
    ".btn__admin__editCategory"
  );
  for (let count = 0; count < editCategoryBtns.length; count++) {
    editCategoryBtns[count].addEventListener("click", (e) => {
      const nameValue =
        document.querySelectorAll(".current__name")[count].innerText;
      const categoryId = e.target.parentElement.parentElement.id;
      const inputCategoryName = document.querySelector("#edit-category-name");
      inputCategoryName.setAttribute("value", nameValue);
      document
        .querySelector(".submit__edit__category")
        .addEventListener("click", (e) => {
          const newValue = inputCategoryName.value;
          console.log(newValue);
          console.log(categoryId);
          fetch(`http://localhost:5000/api/orders/${categoryId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `${newValue}`,
            }),
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => console.log(data));
        });
    });
  }
}

//페이지를 어떻게 다시 불러오지?????
function categoryManagementCreate() {
  const addCategoryBtn = document.querySelector(".submit__category");
  addCategoryBtn.addEventListener("click", (e) => {
    //category-name
    fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${document.querySelector("#category-name").value}`,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        alert(`${data.name} 이(가) 카테고리에 추가되었습니다.`);
        //모달숨기기
        bootstrap.Modal.getInstance("#btn__admin__addCategory").hide();
      });
  });
}

function categoryManagementDelete() {
  const deleteBtns = document.querySelectorAll(".btn__delete");
  for (let count = 0; count < deleteBtns.length; count++) {
    deleteBtns[count].addEventListener("click", (e) => {
      const btnId = e.target.parentElement.parentElement.id;
      document.getElementById(`${btnId}`).remove();
      fetch(`http://localhost:5000/api/orders/${btnId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((alt) => alert(alt));
    });
  }
}

// ====admin-class 모듈화 전 코드(기록용)=====
// function innerOderManagement(name) {
//   return `<!--${name}리스트-->
//   <table class="table text-center">
//   <thead>
//   <tr>
//     <th scope="col"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${name}</font></font></th>
//   </tr>
//     </thead>
//     <thead class="table-light">
//       <tr>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">주문날짜</font>
//           </font>
//         </th>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">주문자</font>
//           </font>
//         </th>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">주문정보</font>
//           </font>
//         </th>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">주문총액</font>
//           </font>
//         </th>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">상태관리</font>
//           </font>
//         </th>
//         <th scope="col">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">취소</font>
//           </font>
//         </th>
//       </tr>
//     </thead>

//     <tbody>
//       <tr>
//         <th scope="row">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">2020-01-01</font>
//           </font>
//         </th>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">청바지, 폰케이스</font>
//           </font>
//         </td>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">장미유</font>
//           </font>
//         </td>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">30000</font>
//           </font>
//         </td>
//         <td>
//         <div class="dropdown">
//           <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
//             수정하기
//           </a>

//           <ul class="dropdown-menu">
//             <li><a class="dropdown-item" href="#">배송전</a></li>
//             <li><a class="dropdown-item" href="#">배송중</a></li>
//             <li><a class="dropdown-item" href="#">배송완료</a></li>
//           </ul>
//         </div>
//         </td>
//         <td>
//           <button type="button" class="btn btn-outline-danger">삭제하기</button>
//         </td>
//       </tr>

//       <tr>
//         <th scope="row">
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">2</font>
//           </font>
//         </th>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">야곱</font>
//           </font>
//         </td>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">손튼</font>
//           </font>
//         </td>
//         <td>
//           <font style="vertical-align: inherit;">
//             <font style="vertical-align: inherit;">@지방</font>
//           </font>
//         </td>
//       </tr>

//     </tbody>
//   </table>`;
// }

function innerUserManagement(name) {
  return `<!--${name}리스트-->
  <table class="table text-center">
  <thead>
  <tr>
    <th scope="col"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${name}</font></font></th>
  </tr>
</thead>
    <thead class="table-light">
      <tr>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">가입날짜</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">이메일</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">이름</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">권한</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">관리</font>
          </font>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">1</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">표시</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">장미유</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@mdo</font>
          </font>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">2</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">야곱</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">손튼</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@지방</font>
          </font>
        </td>
      </tr>
    </tbody>
  </table>`;
}

function innerAddCategory(name) {
  return `<!--${name}리스트-->
  <table class="table text-center">
  <thead>
  <tr>
    <th scope="col"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${name}</font></font></th>
  </tr>
</thead>
    <thead class="table-light">
      <tr>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">생성날짜</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">카테고리 이름</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">수정날짜</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">수정</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">삭제</font>
          </font>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">1</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">표시</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">장미유</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@mdo</font>
          </font>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">2</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">야곱</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">손튼</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@지방</font>
          </font>
        </td>
      </tr>
    </tbody>
  </table>`;
}

function innerAddProduct(name) {
  return `<!--${name}리스트-->
  <table class="table text-center">
  <thead>
  <tr>
    <th scope="col"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${name}</font></font></th>
  </tr>
</thead>
    <thead class="table-light">
      <tr>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">생성날짜</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">이름</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">카테고리</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">가격</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">재고수</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">수정</font>
          </font>
        </th>
        <th scope="col">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">삭제</font>
          </font>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">1</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">표시</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">장미유</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@mdo</font>
          </font>
        </td>
      </tr>
      <tr>
        <th scope="row">
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">2</font>
          </font>
        </th>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">야곱</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">손튼</font>
          </font>
        </td>
        <td>
          <font style="vertical-align: inherit;">
            <font style="vertical-align: inherit;">@지방</font>
          </font>
        </td>
      </tr>
    </tbody>
  </table>`;
}