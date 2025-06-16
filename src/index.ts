// import Signup from './modules/signUp.module';
// TODO: Use Signup here or remove the import if not needed

/**
 * https://umoja.africa/?srsltid=AfmBOooOapOO8HWE6FGsCw8EN2cBsfY0sSwmwqxSr0KJkTLYpQ_n805O
 */
interface AddItems {
	picture: string;
	title: string;
	price: string;
}

const newArrivalInput = document.querySelector(".itemsArrived") as HTMLDivElement;
const womenArrivalInput = document.querySelector(".womenClothes") as HTMLDivElement;
const viewAllButton = document.querySelector(".viewAll") as HTMLButtonElement;
const AddButton = document.querySelector(".addItem") as HTMLButtonElement;

const pictureItem = document.getElementById("newArrivalpicture") as HTMLInputElement;
const titleInput = document.getElementById("newItemTitle") as HTMLInputElement;
const priceInput = document.getElementById("newItemPrice") as HTMLInputElement;

let newArrivals: AddItems[] = JSON.parse(localStorage.getItem("newArrivals") || "[]");
let editNewArrival: number | null = null; //track iindex for editing

const addNewArrivals = () => {
	const file = pictureItem.files?.[0];

	// check empty input

	if (!file || !titleInput.value || !priceInput.value) {
		alert("Please fill all the fields");
		return;
	}

	const reader = new FileReader();

	reader.onload = () => {
		const base64Image = reader.result as string;

		const newAdds: AddItems = {
			picture: base64Image,
			title: titleInput.value,
			price: priceInput.value,
		};

		if (editNewArrival !== null) {
			newArrivals[editNewArrival] = newAdds;
			editNewArrival = null;
		} else {
			newArrivals.push(newAdds); //✅
		}
		//  store to local storage
		localStorage.setItem("newArrivals", JSON.stringify(newArrivals));
		displayNewArrivals();
		clearForm();
	};
	reader.readAsDataURL(file);
};

//functions to display new Items

const displayNewArrivals = () => {
	newArrivalInput.innerHTML = "";
	womenArrivalInput.innerHTML = "";

	newArrivals.forEach((item, index) => {
		const container = document.createElement("div");

		/**
		 * picture
		 * title
		 * price
		 *
		 */

		container.innerHTML = `
            <img src="${item.picture}" alt="item picture">
            <h3>$${item.title}</h3>
            <p>${item.price}</p>
            <button class="viewOption">View OPtion</button>
        `;
		let selectedOption = (document.getElementById("option") as HTMLSelectElement).value;
		// alert("Choose availabel option 1 for new arrivals 2 women wear.");

		if (selectedOption === "1") {
			newArrivalInput.appendChild(container);
		} else if (selectedOption === "2") {
			womenArrivalInput.appendChild(container);
		}
	});
};

const clearForm = () => {
	pictureItem.value = "";
	titleInput.value = "";
	priceInput.value = "";
};
if (AddButton) {
	AddButton.addEventListener("click", addNewArrivals);
	displayNewArrivals();
}
