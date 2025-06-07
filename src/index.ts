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
const viewAllButton = document.querySelector(".viewAll") as HTMLButtonElement;
const AddButton = document.querySelector(".addItem") as HTMLButtonElement;

const pictureItem = document.getElementById("newArrivalpicture") as HTMLInputElement;
const titleInput = document.getElementById("newItemTitle") as HTMLInputElement;
const priceInput = document.getElementById("newItemPrice") as HTMLInputElement;

let newArrivals: AddItems[] = JSON.parse(localStorage.getItem("newArrivals") || "[]");
let editNewArrival: number | null = null; //track iindex for editing

const addNewArrivals = () => {

    const file = pictureItem.files?.[0];

	const newAdds = {
		picture: pictureItem.value,
		title: titleInput.value,
		price: priceInput.value,
	};
	// check empty input

	if (!newAdds.picture || !newAdds.title || !newAdds.price) {
		alert("Please fill all the fields");
		return;
	}
	if (editNewArrival !== null) {
		newArrivals[editNewArrival] = newAdds;
		editNewArrival = null;
	} else {
		newArrivals.push(newAdds); //✅
	}
	//  store to local storage
	localStorage.setItem("newArrivals", JSON.stringify(newArrivals));
	displayNewArrivals();
	// clearForm();
};

//functions to display new Items

const displayNewArrivals = () => {
    newArrivalInput.innerHTML = "";

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
            <p>${item.price}</h3>
            <button class="viewOption">View OPtion</button>
        `;

		newArrivalInput.appendChild(container);
	});
};

AddButton.addEventListener("click", addNewArrivals);
displayNewArrivals();
