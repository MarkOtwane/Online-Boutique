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
const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
const lastNameInput = document.getElementById("lastName") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const phoneNumberInput = document.getElementById("phoneNumber") as HTMLInputElement;
const streetInput = document.getElementById("lastName") as HTMLInputElement;
const cityInput = document.getElementById("lastName") as HTMLInputElement;
const zipCodeInput = document.getElementById("lastName") as HTMLInputElement;
const passwordInput = document.getElementById("lastName") as HTMLInputElement;
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
        password: passwordInput.value ,
		address: {
			street: streetInput.value,
			city: cityInput.value,
			zipCode: zipCodeInput.value
		}
    };
    if (!signUp.firstName || !signUp.lastName || !signUp.email || !signUp.phoneNumber || !signUp.password || !signUp.address) {
        alert('All the input fields are required!');
        return;
    }
	// Save the new user to localStorage
	signUpNewUser.push(signUp);
	localStorage.setItem("signUpNewUser", JSON.stringify(signUpNewUser));
	alert('Sign up successful!');
}

signUpButton.addEventListener('click', signUp);
