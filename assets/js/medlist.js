/**
 * AUTO show/hide bottom nav onscroll.
 */
const bottomNav = document.getElementById("bottomNav");
bottomNav.style.transition = "all 0.3s ease-in-out";
let prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    bottomNav.style.transform = "translateY(100%)";
  } else {
    bottomNav.style.transform = "translateY(0)";
  }
  prevScrollpos = currentScrollPos;
};

// const medlistBody = document.getElementById('medlistBody');
const medlistList = document.getElementById("medlistList");
const medlistSearchBox = document.getElementById("medlistSearchBox");
const medlistSearchBoxClear = document.getElementById("medlistSearchBoxClear");

const loader =
  '<img class="mx-auto mt-5" style="width:200px; height:200px;" src="assets/images/loader.gif"></img>';
window.onload = medlistList.innerHTML = loader;

let jsonMeds = [],
  jsonMedsAvl = [];

async function fetchData() {
  let jsonMedsData = [];

  const medsDataResponse = await fetch("/assets/json/meds-data-min.json");
  jsonMedsData = await medsDataResponse.json();

  const medsAvlResponse = await fetch("/assets/json/meds-avl-min.json");
  jsonMedsAvl = await medsAvlResponse.json();

  for (let i = 0; i < jsonMedsData.length; i++) {
    jsonMeds.push({
      ...jsonMedsData[i],
      ...jsonMedsAvl.find((item) => item.dc === jsonMedsData[i].dc),
    });
  }
  console.log(jsonMeds);
  return jsonMeds;
}

function listMeds(data, toAppend) {
  // standalone function for displaying list from 'data' js object.

  const arrLength = data.length;
  const divideInto = 6;
  const chunkSize = Math.trunc(arrLength / divideInto);

  const rem = arrLength % 6;

  let iteration = 0;

  const iterations = rem ? divideInto : divideInto + 1;

  medlistList.innerHTML = "";

  setTimeout(function generateRows() {
    const base = chunkSize * iteration;
    const loopSize = iteration != 6 ? base + chunkSize : base + rem;
    let text = "";

    for (let i = base; i < loopSize; i++) {
      text =
        text +
        `<li class="list-group-item d-flex pb-3 ps-2 ${
          data[i].avl ? "list-group-item-success" : "list-group-item-danger"
        }">
                      <div class="ms-2 w-100">
                        <div>${data[i].gn}</div>
                        <div class="d-flex justify-content-between text-muted pe-2">
                          <small>(${data[i].dc})</small>
                          <small>${data[i].us}</small>
                          <small>${
                            data[i].mrp
                              ? "Rs. " + data[i].mrp
                              : "Under Processing"
                          }</small>
                          <input id="mcb" type="checkbox" data-dc="${
                            data[i].dc
                          }" ${data[i].avl ? "checked" : ""}>
                        </div>
                      </div>
                    </li>`;
    }

    toAppend.insertAdjacentHTML("beforeend", text);

    iteration++;

    if (iteration < iterations) setTimeout(generateRows, 0);
  }, 0);
}

function filterMeds(value) {
  let filter = value.toLowerCase().trim();

  let li = medlistList.getElementsByTagName("li");

  const rowCount = li.length;
  const divideInto = 6;
  const chunkSize = rowCount / divideInto;
  let iteration = 0;

  setTimeout(function generateRows() {
    const base = chunkSize * iteration;
    const loopSize = base + chunkSize;

    // Loop through all list items, and hide those who don't match the search query

    let liElm, i, txtValue;

    for (i = base; i < loopSize; i++) {
      liElm = li[i].children[0].children[0];

      txtValue = liElm.textContent || liElm.innerText;

      if (txtValue.toLowerCase().trim().indexOf(filter) > -1) {
        if (li[i].hasAttribute("style")) li[i].removeAttribute("style");
      } else if (!li[i].hasAttribute("style")) {
        li[i].setAttribute("style", "display:none!important");
      }
    }

    iteration++;

    if (iteration < divideInto) setTimeout(generateRows, 0);
  }, 0);
}

// function debounce(func, timeout = 300) {
//   let timer;
//   return () => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func.apply();
//     }, timeout);
//   };
// }

fetchData().then((data) => {
  listMeds(data, medlistList);

  let timer;

  medlistSearchBox.addEventListener("input", (input) => {
    let value = input.target.value;

    medlistSearchBoxClear.style.display = value.length != 0 ? "block" : "none";

    clearTimeout(timer);

    timer = setTimeout(() => {
      filterMeds(value);
    }, 300);

    // debounce(() => {
    //   filterMeds(value);
    // });
  });

  // jsonMedsData = jsonMeds.map(item => {
  //   return {
  //           "dc": parseInt(item.dc),
  //           "gn": item.gn,
  //           "us": item.us,
  //           "mrp": parseInt(item.mrp)
  //          }
  //   });
  // console.log(JSON.stringify(jsonMedsData));
  // console.log(JSON.stringify(jsonMedsData.sort((a, b) => a.dc - b.dc)));

  // jsonMedsAvl = jsonMeds.map(item => {
  //   return {
  //     "dc": parseInt(item.dc),
  //     "avl": item.avl
  //          }
  //   });
  // console.log(JSON.stringify(jsonMedsAvl));
  // console.log(JSON.stringify(jsonMedsAvl.sort((a, b) => a.dc - b.dc)));
});

/**
 * Logged In
 */

const btnUpdationQueue = document.getElementById("btnUpdationQueue");
const counterBtnUpdationQueue = document.getElementById(
  "counterBtnUpdationQueue"
);

const btnUpdate = document.getElementById("btnUpdate");
const counterBtnUpdate = document.getElementById("counterBtnUpdate");

const medlistUpdateQueueDialog = document.getElementById(
  "medlistUpdateQueueDialog"
);

var updationQueue = [];

medlistList.addEventListener("click", editUpdationQueue);

function editUpdationQueue(e) {
  if ("mcb" === e.target.id) {
    let dc = parseInt(
      e.target.parentElement.children[0].innerHTML.match(/\d+/)
    );

    let dc_jsonMedsIndx = jsonMeds.findIndex((item) => item.dc === dc);

    jsonMeds[dc_jsonMedsIndx].avl = Number(e.target.checked);

    let dc_updationQueueIndx = updationQueue.findIndex(
      (item) => item.dc === dc
    );

    if (dc_updationQueueIndx > -1) {
      updationQueue.splice(dc_updationQueueIndx, 1);
    } else {
      var updationMed = {
        dc: dc,
        gn: jsonMeds[dc_jsonMedsIndx].gn,
        us: jsonMeds[dc_jsonMedsIndx].us,
        mrp: jsonMeds[dc_jsonMedsIndx].mrp,
        avl: jsonMeds[dc_jsonMedsIndx].avl,
      };

      updationQueue.push(updationMed);
    }

    let counterUpdationQueue = updationQueue.length ? updationQueue.length : "";
    counterBtnUpdationQueue.innerHTML = counterUpdationQueue;
    counterBtnUpdate.innerHTML = counterUpdationQueue;
  }

  e.stopPropagation(); //warning
}

/** Event listener for when first Update button in medlist screen is clicked.
 * It resets the Updation Queue Dialog by setting its innerHTML to black string.
 * Then regenerates the list in Updation Queue Dialog from the updationQueue[] array reusing the listMeds function.
 */
btnUpdationQueue.addEventListener("click", function () {
  medlistUpdateQueueDialog.innerHTML = "";

  let text = "";

  for (let i = 0; i < updationQueue.length; i++) {
    text =
      text +
      `<li class="list-group-item d-flex pb-3 ps-2 ${
        updationQueue[i].avl
          ? "list-group-item-success"
          : "list-group-item-danger"
      }">
                      <div>${i + 1}. </div>
                      <div class="ms-2 w-100">
                      <div class="h6">${updationQueue[i].gn}</div>
                      <div class="d-flex justify-content-between text-muted pe-2">
                        <small>(${updationQueue[i].dc})</small>
                        <small>${updationQueue[i].us}</small>
                        <small>${
                          updationQueue[i].mrp
                            ? "Rs. " + updationQueue[i].mrp
                            : "Under Processing"
                        }</small>
                        <input id="mcb" type="checkbox" data-dc="${
                          updationQueue[i].dc
                        }" ${updationQueue[i].avl ? "checked" : ""}>
                      </div>
                    </div>
                  </li>`;
  }

  medlistUpdateQueueDialog.innerHTML = text;
});

/** Event Listener for when med checkbox in Update Queue Dialog is clicked upon.
 * It catches the event and does the following operations.
 */
medlistUpdateQueueDialog.addEventListener("click", function (e) {
  if ("mcb" === e.target.id) {
    // reusing the function to remove the clicked meds object from updationQueue[] array.
    editUpdationQueue(e);

    // code to restore the med's previous state (check/unchecked) in medlist when med is removed from UpdateQueue dialog.
    const medCbxId = `[data-dc="${e.target.dataset.dc}"]`;
    // Select element inside main list
    let medlistList_medCbx = medlistList.querySelector(medCbxId);
    medlistList_medCbx.checked = !medlistList_medCbx.checked;

    // Select element inside search list
    // let searchResults_medCbx = medlistListSearchResults.querySelector(medCbxId);
    // if(searchResults_medCbx != null) searchResults_medCbx.checked = !searchResults_medCbx.checked; //Discard if not in search result

    // finally remove the med's parent container (li) element from updation queue dialog with a fade out effect.
    e.target.parentElement.parentElement.parentElement.style.transition =
      "opacity 0.5s ease";
    e.target.parentElement.parentElement.parentElement.style.opacity = 0;

    setTimeout(function () {
      e.target.parentElement.parentElement.parentElement.remove();
    });
  }

  // stope event propagation going any further then where event listener is added (medlistUpdateQueueDialog).
  e.stopPropagation(); //warning
});

// // medlist search box clear button

medlistSearchBoxClear.addEventListener("click", () => {
  medlistSearchBox.value = "";
  medlistSearchBox.dispatchEvent(new Event("input", { bubbles: true }));
});

// function loadOcto() {
//   const scriptTag = document.createElement("script");
//   scriptTag.setAttribute('type', 'module');
//   const textNode = document.createTextNode("import { Octokit } from 'https://cdn.skypack.dev/octokit';");
//   scriptTag.appendChild(textNode);
//   document.body.appendChild(scriptTag);
//   // scriptTag.remove()
// }

import { Octokit } from "https://cdn.skypack.dev/octokit";

const octokit = new Octokit({
  auth: "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",
});

async function orequest() {
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();

  console.log("Hello, %s", login);

  const {
    data: { sha },
  } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "amitexm",
    repo: "medsy",
    path: "assets/json/meds-test3.json",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  console.log(sha);

  const updateReq = await octokit.request(
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "amitexm",
      repo: "medsy",
      path: "assets/json/meds-test3.json",
      message: "change avl",
      committer: {
        name: "amitexm",
        email: "amitexm@github.com",
      },
      content: "bmV3IGZpbGUgY29udGVudCB1cGRhdGVk",
      sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  console.log(updateReq);
}

orequest();
