"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

// Render Markup for Story //
function generateStoryMarkup(story, showDeleteBtn = false, showEditBtn = false) {
  // console.debug("generateStoryMarkup", story);
  const isLoggedIn = Boolean(currentUser);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        ${showEditBtn ? getEditBtnHTML() : ""}
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${isLoggedIn ? getStarHTML(currentUser, story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// Make delete button HTML for story //
function getDeleteBtnHTML() {
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

// Make Star HTML for story //
function getStarHTML(user, story){
  const isFavorite = user.isFavorite(story);
  const favoriteType = isFavorite ? "fas" : "far"
  return `<span class="star">
            <i class="${favoriteType} fa-star"></i>
          </span>`;
}

// Make Edit HTML for story //
function getEditBtnHTML(){
  return `
  <span class="edit-btn">
    <i class="fas fa-edit"></i>
  </span>`;
}

// Gets list of stories from server, generates their HTML, and puts on page. //
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// HANDLE DELETE STORY //
async function deleteStory(evt) {
  console.debug("deleteStory");
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

// HANDLE EDIT STORY CLICK //
async function editStoryClick(evt) {
  console.debug("editStoryClick", evt);
  console.log($(evt.target).parentsUntil('ol'));
 
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  console.log(storyId);
  // storyId = story.storyId; 
  const response = await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "GET",
  });

  $('#edit-storyId').val(response.data.story.storyId);
  $('#edit-author').val(response.data.story.author);
  $('#edit-title').val(response.data.story.title);
  $('#edit-url').val(response.data.story.url);

  $editForm.show(); 
}

$ownStories.on("click", ".edit-btn", editStoryClick);

// HANDLE EDIT STORY FORM //
async function editStorySubmit(evt) {
  evt.preventDefault();

  const storyId = $("#edit-storyId").val();
  const author = $("#edit-author").val();
  const title = $("#edit-title").val();
  const url = $("#edit-url").val();
  const token = currentUser.loginToken;

  const storyData = { author, title, url, storyId };

  const story = await storyList.editStory(currentUser, storyData);
  console.log(story);

  location.reload();
}
  
$editForm.on("submit", editStorySubmit);

// HANDLE EDIT STORY SUBMIT //
async function addSubmittedStory(evt) {
  // TODO: add try and catch
  evt.preventDefault();
  const author = $("#submit-author").val();
  const title = $("#submit-title").val();
  const url = $("#submit-url").val();
  const username = currentUser.username;
  const storyData = { author, title, url, username };

  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
 
  $submitForm.hide();
  $submitForm.trigger("reset");
}

// add evetn listener to submit form //
$submitForm.on("submit", addSubmittedStory);


// MARK-UP OF USER STORIES LIST //
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();
  console.log($ownStories);

  if (currentUser.ownStories.length === 0) {
    console.log(`in if`);
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    console.log(`in else`)
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
  
      let $story = generateStoryMarkup(story, true, true);
      console.log($story);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

// MARK-UP OF FAVORITE STORIES LIST //
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    console.log(currentUser.favorites);
    for (let story of currentUser.favorites) {
      console.log(story);
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
      console.log($favoritedStories);
    }
  }

  $favoritedStories.show();
}

// HANDLES SWITCHING FOR FAVORITE/NOT FAVORITE //
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);