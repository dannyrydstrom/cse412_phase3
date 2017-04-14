'use strict';

var uidField;
var passField;
var loginbtn;

window.onload = function() {
    uidField = document.getElementById("uidField");
    passField = document.getElementById("passField");
    loginbtn = document.getElementById("loginbtn");
    loginbtn.addEventListener("click", loginClicked);
};

function loginClicked() {
    var username = textField.value;
    var password = passField.value;
}
