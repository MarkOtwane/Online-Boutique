/**
 * sign up module
 * https://umoja.africa/?srsltid=AfmBOorzKnu2R_2hSaZRytLjhEyA36u0PQkOYIEF-g-un0BmDzxGHdXc
 * @param
 * @return sign up
 */

interface SignUp {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: {
		street: string;
		city: string;
		zipCode: string;
	};
	password: string;
}

//Dom
const firstNameInput = document.getElementById("firstName") as HTMLInputElement;
const lastNameInput = document.getElementById("lastName") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const phoneNumberInput = document.getElementById("phoneNumber") as HTMLInputElement;
const streetInput = document.getElementById("street") as HTMLInputElement;
const cityInput = document.getElementById("city") as HTMLInputElement;
const zipCodeInput = document.getElementById("zipcode") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const signUpButton = document.getElementById("signUpBtn") as HTMLButtonElement;

let signUpNewUser: SignUp[] = JSON.parse(localStorage.getItem("signUpNewUser") || "[]");

/**
 * sign up function
 * @param
 * @return signup()
 */
const signUp = () => {
	const signUp: SignUp = {
		firstName: firstNameInput.value,
		lastName: lastNameInput.value,
		email: emailInput.value,
		phoneNumber: phoneNumberInput.value,
		password: passwordInput.value,
		address: {
			street: streetInput.value,
			city: cityInput.value,
			zipCode: zipCodeInput.value,
		},
	};
	if (!signUp.firstName || !signUp.lastName || !signUp.email || !signUp.phoneNumber || !signUp.password || !signUp.address) {
		alert("All the input fields are required!");
		return;
	}
	// Save the new user details  to localStorage
	signUpNewUser.push(signUp);
	localStorage.setItem("signUpNewUser", JSON.stringify(signUpNewUser));
	alert("Sign up successful!");
	// call the login function from
	window.location.href = "../html/login.html";

	clearInput();
};

const clearInput = () => {
	firstNameInput.value = "";
	lastNameInput.value = "";
	emailInput.value = "";
	phoneNumberInput.value = "";
	passwordInput.value = "";
	streetInput.value = "";
	cityInput.value = "";
	zipCodeInput.value = "";
};



interface Login {
	email: string;
	password: string;
}

// DOM
const loginEmail = document.getElementById("logEmail") as HTMLInputElement;
const loginPassword = document.getElementById("logPassword") as HTMLInputElement;
const loginBtn = document.querySelector(".login") as HTMLButtonElement;

const login = () => {
	const logins: Login = {
		email: loginEmail.value.trim().toLowerCase(),
		password: loginPassword.value,
	};

	if (!logins.email || !logins.password) {
		alert("All input fields are required!");
		return;
	}

	// Find a matching user in the array
	const matchedUser = signUpNewUser.find((user: { email: string; password: string; }) => user.email.trim().toLowerCase() === logins.email && user.password === logins.password);

	if (matchedUser) {
		alert("Login successful!");
		window.location.href = "../html/index.html"; // Redirect
	} else {
		alert("Wrong email or password! Try again.");
	}

	clearLogins();
};

const clearLogins = () => {
	loginEmail.value = "";
	loginPassword.value = "";
};

signUpButton.addEventListener("click", (event) => {
	event.preventDefault();
	signUp();
});

loginBtn.addEventListener("click", (e) => {
	e.preventDefault();
	login();
});