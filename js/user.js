"use strict";

// VARIABLE PLACEHOLDER TO MAKE AVAILABLE USER GLOBALLY //
let currentUser;

// Handle login form submission. If login ok, sets up the user instance //
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password //
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance //
  // which we'll make the globally-available, logged-in user. //
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);
// Get List of Users to error check for a duplicate //
async function getUserList() {

}

// Handle signup form submission. //
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  
    $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

// Handle click of logout button //
// Remove their credentials from localStorage and refresh page //
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);


 // Storing/recalling previously-logged-in-user with localStorage //
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  currentUser = await User.loginViaStoredCredentials(token, username);
}

// FUNCTION TO STORE CREDENTIALS IN LOCALSTORAGE //
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}


// UPDATE DOM ON USER LOGIN //
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();
  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
}