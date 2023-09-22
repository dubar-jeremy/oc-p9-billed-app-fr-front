import { formatDate } from "../app/format.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Logout from "./Logout.js";

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem("user")).email;
          selectCondition =
            bill.status === status &&
            ![...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[0]
    : "";
  const lastName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[1]
    : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${
    bill.id
  }'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));
    new Logout({ localStorage, onNavigate });
  }

  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url");
    const imgWidth = Math.floor($("#modaleFileAdmin1").width() * 0.8);
    $("#modaleFileAdmin1")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
      );
    if (typeof $("#modaleFileAdmin1").modal === "function")
      $("#modaleFileAdmin1").modal("show");
  };

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
      this.counter++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });

      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
      this.counter++;
    }
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  // handleShowTickets(e, bills, index) {
  //   if (this.counter === undefined || this.index !== index) this.counter = 0;
  //   if (this.index === undefined || this.index !== index) this.index = index;
  //   if (this.counter % 2 === 0) {
  //     $(`#arrow-icon${this.index}`).css({ transform: "rotate(0deg)" });
  //     $(`#status-bills-container${this.index}`).html(
  //       cards(filteredBills(bills, getStatus(this.index)))
  //     );
  //     this.counter++;
  //   } else {
  //     $(`#arrow-icon${this.index}`).css({ transform: "rotate(90deg)" });
  //     $(`#status-bills-container${this.index}`).html("");
  //     this.counter++;
  //   }

  //   bills.forEach((bill) => {
  //     $(`#open-bill${bill.id}`).click((e) =>
  //       this.handleEditTicket(e, bill, bills)
  //     );
  //   });

  //   return bills;
  // }

  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0;
    if (this.index === undefined || this.index !== index) this.index = index;
    const $statusBillsContainer = $(`#status-bills-container${this.index}`);

    if (this.counter % 2 === 0) {
      $statusBillsContainer.find(".bill-card").css({ background: "#0D5AE5" });
      $statusBillsContainer.html(
        cards(filteredBills(bills, getStatus(this.index)))
      );
      this.counter++;
    } else {
      $statusBillsContainer.find(".bill-card").css({ background: "#0D5AE5" });
      $statusBillsContainer.html("");
      this.counter++;
    }


    // Problem: The following code was adding a click event handler to the tickets each time the list was created.
    // it was causing the click event to be triggered multiple times.
    // ex: if the list was created 3 times, the click event was triggered 3 times.

    // bills.forEach(bill => {
    //   $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    // })

    // Solution: The following code is adding a click event handler to the tickets only once.
    // it is preventing the click event to be triggered multiple times.
    // ex: if the list is created 3 times, the click event is triggered only once.

    /**
     * @off method removes event handlers that were attached with .on()
     * @on method attaches event handlers to the selected elements
     * @click method attaches an event handler function to be executed when the click event occurs
     */
    $statusBillsContainer.off("click").on("click", ".bill-card", (e) => {
      console.log(e.currentTarget.id)

      // get the id of the clicked ticket without the prefix "open-bill"
      const clickedBillId = e.currentTarget.id.replace("open-bill", "");

      // find the clicked ticket in the bills list
      const clickedBill = bills.find((bill) => bill.id === clickedBillId);

      // display the clicked ticket in the dashboard right container
      this.handleEditTicket(e, clickedBill, bills);
    });

    return bills;
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id,
            ...doc,
            date: doc.date,
            status: doc.status,
          }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((bill) => bill)
        .catch(console.log);
    }
  };
}
