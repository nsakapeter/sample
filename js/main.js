"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");

// selector that finds all three story lists
const $storiesLists = $(".stories-list"); 

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $submitForm = $("#submit-form");
const $editForm = $("#edit-form");

const $navSubmit = $("#nav-submit")
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");


// SHOW/HIDE COMPONENTS //
function hidePageComponents() {
  const components = [
    $storiesLists,
    $submitForm,
    $loginForm,
    $signupForm,
    $editForm
    // $userProfile
  ];
  components.forEach(c => c.hide());
}

// START FUNCTION //
async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// LOADED DOM = START //
$(start);