const nomiDDL = document.getElementById("Nomi"),
  getLink = document.getElementById("GET-Link"),
  inputs = document.getElementsByTagName("input");

let linkString = getLink.getAttribute("href"),
  previusName;
const regex = /[^a-z0-9]/gi;

for (let i = 0; i < inputs.length - 1; i++) {
  inputs[i].addEventListener("keyup", (_) => {
    inputs[i].value = inputs[i].value.replace(regex, "");
  });
}

nomiDDL.addEventListener("change", (_) => {
  if (nomiDDL.value !== "OPTIONS") {
    if (!linkString.includes("_Nome_"))
      getLink.setAttribute(
        "href",
        linkString.replace(previusName, nomiDDL.value)
      );
    getLink.setAttribute("href", linkString.replace("_Nome_", nomiDDL.value));
  } else
    getLink.setAttribute("href", linkString.replace(previusName, "_Nome_"));
  previusName = nomiDDL.value;
});
