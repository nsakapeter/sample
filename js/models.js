"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";


// STORY "COOKIE MOLD" MAKER //
class Story {

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }
  // PARSE HOSTNAME //
  getHostName() {
    return new URL(this.url).host;
  }
}

// LIST COLLECTION OF STORY INSTANCES //
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // GET ALL STORIES //
  static async getStories() {
    // query the /stories endpoint (no auth required) //
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class //
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories //
    return new StoryList(stories);
  }

  // GET STORY BY ID //
   async getStoryById(storyId) {

    const response = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "GET",
    });
  }

  // ADD STORY - HANDLE DATA //
  async addStory(user, newStory) {
    const token = user.loginToken;
    const resp = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: {
        token,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: newStory.url
        }
      },
    });
   
    const story = new Story(resp.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);
    return story;
  }

  // REMOVE STORY HANDLE DATA //
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });

    // filter out the story whose ID we are removing
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    // do the same thing for the user's list of stories & their favorites
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }

  // EDIT STORY HANDLE DATA //
  async editStory(user, storyData) {
    console.debug("editStory");
    const token = user.loginToken;
    const resp = await axios({
      method: "PATCH",
      url: `${BASE_URL}/stories/${storyData.storyId}`,
      data: {
        token,
        story: {
          author: storyData.author,
          title: storyData.title,
          url: storyData.url
        }
      },
    });
    const story = new Story(resp.data.story);

    return story;
  }
}

// CLASS USED TO REPRESENT THE CURRENT USER //
class User {

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  // ADDED ERROR CHECKING TO FORM AND MESSAGE TO USER //
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    })
    .catch(error => {
      alert(error.response.data.error.message);
      $signupForm.trigger("reset");
    });

    return new User(response.data.user, response.data.token);
  }

  //  Login in user with API, make User instance & return it. //
  // ADDED ERROR CHECKING TO FORM AND MESSAGE TO USER //
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    })
    .catch(error => {
      alert(error.response.data.error.message);
      $loginForm.trigger("reset");
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // LOGIN VIA STORED CREDENTIALS IN LOCALSTORAGE //
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // ADD STORY TO FAVORITES //
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story)
  }

  // REMOVE STORY FORM FAVORITES //
  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

 // UPDATE API WITH FABVORITES ADDING OR REMOVING NEW STORY INSTANCE //
  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  //is favorite story //
  isFavorite(story){
    return this.favorites.some(favorite => {
      return favorite.storyId === story.storyId
    })
  }

}

