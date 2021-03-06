import jwt_decode from "jwt-decode"; //library that helps decoding JWTs token which are Base64Url encoded

// $ npm install jwt-decode

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			people: [],
			planets: [],
			favorites: [],
			loading: true,
			token: null,
			favorites_raw: [],
			current_username: "",
			url: "https://3000-lime-lamprey-xbyaj27l.ws-us03.gitpod.io" // change this! See below, do NOT add slash '/' at the end

			// url: refer to API created in repository: https://github.com/litzcode/python-flask-starwars-reading-blog for URL
			// run in Postman GET 'URL/populate' to populate database for testing purposes
			// email: user01@example.com , password: 01
		},
		actions: {
			// using Async Await because it allows me to use .then() to getFavorites in login.js file afer user login
			login: async (email, password) => {
				const store = getStore();

				const URL = `${store.url}/token`; // API to create token
				const CONFIG = {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						email: email,
						password: password
					})
				};

				try {
					const resp = await fetch(URL, CONFIG);
					if (resp.status !== 200) {
						alert("There was an error during authentication");
						return false;
					}

					const data = await resp.json();
					console.log("Token created from back-end", data);
					sessionStorage.setItem("token", data.access_token);
					setStore({ token: data.access_token });
					return true;
				} catch (error) {
					console.error("CREATE Token error: ", error);
				}

				// With sessionStorage , the data is persisted only until the window or tab is closed.
				// With localStorage , the data is persisted until the user manually clears the browser cache or until your web app clears the data.
			},

			// to setStore with token on every refresh, so this function is called on appContext.js file
			storeSessionToken: () => {
				const token = sessionStorage.getItem("token");
				if (token && token != "" && token != undefined) setStore({ token: token });
			},

			storeSessionUser: () => {
				const store = getStore();
				const current_username = sessionStorage.getItem("current_username");
				if (store.token && store.token != "" && store.token != undefined)
					setStore({ current_username: current_username });
			},

			logout: () => {
				sessionStorage.removeItem("token");
				sessionStorage.removeItem("current_username");
				setStore({ token: null, favorites: [], favorites_raw: [], current_username: "" });
			},

			getPeople: () => {
				const store = getStore();

				fetch(`${store.url}/character/`)
					.then(resp => {
						console.log("GET people request: ", resp.ok);
						resp.status >= 200 && resp.status < 300
							? console.log("GET people successful, status: ", resp.status)
							: console.error("GET people failed, status: ", resp.status);
						return resp.json();
					})
					.then(data => {
						setStore({ people: data, loading: false });
						console.log("People array: ", data);
					})
					.catch(error => console.error("GET people error: ", error));
			},

			getPlanets: () => {
				const store = getStore();

				fetch(`${store.url}/planet/`)
					.then(resp => {
						console.log("GET planets request: ", resp.ok);
						resp.status >= 200 && resp.status < 300
							? console.log("GET planets successful, status: ", resp.status)
							: console.error("GET planets failed, status: ", resp.status);
						return resp.json();
					})
					.then(data => {
						setStore({ planets: data, loading: false });
						console.log("Planets array: ", data);
					})
					.catch(error => console.error("GET planets error: ", error));
			},

			getCurrentUser: () => {
				// add this function to login.js
				const store = getStore();

				if (store.token && store.token != "" && store.token != undefined) {
					const current_user_id = jwt_decode(store.token).sub; // jwt_decode returns the jwt object payload. Using "jwt debugger" we can see that .sub retuns the id in this case
					console.log("Current user IDs from token with jwt_decode: ", current_user_id);

					fetch(`${store.url}/user/${current_user_id}`)
						.then(resp => {
							console.log("GET current user request: ", resp.ok);
							resp.status >= 200 && resp.status < 300
								? console.log("GET current user successful, status: ", resp.status)
								: console.error("GET current user failed, status: ", resp.status);
							return resp.json();
						})
						.then(data => {
							sessionStorage.setItem("current_username", data.username);
							setStore({ current_username: data.username, loading: false });
							console.log("Current user: ", data);
						})
						.catch(error => console.error("GET current user error: ", error));
				}
			},

			getFavorites: () => {
				const store = getStore();

				if (store.token && store.token != "" && store.token != undefined) {
					const URL = `${store.url}/favorite`;
					const CONFIG = {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + store.token
						}
					};

					fetch(URL, CONFIG)
						.then(resp => {
							console.log("GET favorites request: ", resp.ok);
							resp.status >= 200 && resp.status < 300
								? console.log("GET favorites successful, status: ", resp.status)
								: console.error("GET favorites failed, status: ", resp.status);
							return resp.json();
						})
						.then(data => {
							setStore({ favorites: data, loading: false });
							console.log("Favorites array from getFavorites(): ", data);
						})
						.catch(error => console.error("GET favorites error: ", error));
				}
			},

			// to get favorites id
			getFavoritesRaw: () => {
				const store = getStore();

				if (store.token && store.token != "" && store.token != undefined) {
					const URL = `${store.url}/favorite_raw`;
					const CONFIG = {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + store.token
						}
					};

					fetch(URL, CONFIG)
						.then(resp => {
							console.log("GET favorite_raw request: ", resp.ok);
							resp.status >= 200 && resp.status < 300
								? console.log("GET favorite_raw successful, status: ", resp.status)
								: console.error("GET favorite_raw failed, status: ", resp.status);
							return resp.json();
						})
						.then(data => {
							setStore({ favorites_raw: data, loading: false });
							console.log("Favorite_raw array from getFavoritesRaw(): ", data);
						})
						.catch(error => console.error("GET favorite_raw error: ", error));
				}
			},

			addFavorite: item => {
				const store = getStore();

				const token = sessionStorage.getItem("token");
				console.log(token);
				const tokenPayload = jwt_decode(token).sub; // jwt_decode returns the jwt object payload. Using "jwt debugger" we can see that .sub retuns the id in this case
				console.log("ID obtained from token with jwt_decode: ", tokenPayload);
				console.log("Item passed as parameter to addFavorite(): ", item);

				let filteredResults = store.favorites.filter(function(currentElement) {
					// the current value is an object, so you can check on its properties
					return currentElement.id == item.id && currentElement.item_type == item.item_type;
				});

				console.log("Filtered result: ", filteredResults);

				if (filteredResults.length == 0) {
					const URL = `${store.url}/favorite`;
					const CONFIG = {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + store.token
						},
						body: JSON.stringify({
							item_id: item.id,
							item_type: item.item_type,
							user_id: tokenPayload
						})
					};

					fetch(URL, CONFIG)
						.then(resp => {
							if (resp.status === 200) return resp.json();
							else alert("There was some error while adding the favorite");
						})
						.then(data => {
							console.log("Favorite added to DB: ", data);
							getActions().getFavorites();
						})
						.then(() => getActions().getFavoritesRaw()) // added to allow deletion of items just added, otherwise a Refresh is needed
						.catch(error => {
							console.error("CREATE Token error: ", error);
						});
				} else alert("Item already added to favorites");
			},

			removeFavorite: favoriteId => {
				const store = getStore();

				const URL = `${store.url}/favorite/${favoriteId}`;
				const CONFIG = {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + store.token
					}
				};

				fetch(URL, CONFIG)
					.then(resp => {
						console.log("DELETE favorites request: ", resp.ok);
						resp.status >= 200 && resp.status < 300
							? console.log("DELETE favorites successful, status: ", resp.status)
							: console.error("DELETE favorites failed, status: ", resp.status);
						return resp.json();
					})
					.then(() => getActions().getFavorites()) // remember to use callback function, otherwise it wont work
					.then(() => getActions().getFavoritesRaw())
					.catch(error => console.error("DELETE favorites error: ", error));

				console.log("This is the URL to remove: ", URL);

				console.log("This the fav ID to remove: ", favoriteId);
			},

			handleOnSelectCharacter: item => {
				console.log("Selected character on search", item);
				setStore({ people: [item] });
			},

			handleOnFocusCharacter: () => {
				console.log("Focused");
				getActions().getPeople();
			},

			handleOnSelectPlanet: item => {
				console.log("Selected planet on search", item);
				setStore({ planets: [item] });
			},

			handleOnFocusPlanet: () => {
				console.log("Focused");
				getActions().getPlanets();
			},

			// Use getActions to call a function within a function
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			loadSomeData: () => {
				/**
					fetch().then().then(data => setStore({ "foo": data.bar }))
				*/
			}
		}
	};
};

export default getState;
