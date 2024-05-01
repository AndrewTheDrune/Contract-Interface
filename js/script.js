import { abi } from "./abi.js";
import { getContract } from "./utils.js";
import { displayTransfers } from "./displayTransfers.js";
const contractAddress = "0xB1B6A90a567448015129D2e7e6e9E47a5aC0C4C0";

const header = document.querySelector('header');
const select = document.querySelector('.dropdown');
const divLogIn = document.querySelector('.logIn-div');
const buttonLogIn = document.querySelector('.logIn-button');
const divMain = document.querySelector('.main-div');
const mainButtonExit = document.querySelector('#exit-button');
const mainButtonTransact = document.querySelector('.main-button-transact');

const accountText = document.getElementById("account-text");
const balanceText = document.getElementById("balance-text");

let web3, accounts, userAccount, balanceWei, balanceEther;

header.style.display = "none";
divMain.style.display = "none";
mainButtonExit.style.display = "none";

async function createAccountsList(){
    web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:8545'));
    accounts = await web3.eth.getAccounts();
    createList(accounts);
}

function createList(accounts){
    for (let i = 0; i < accounts.length; i++) {
        const option = document.createElement("option");
		option.className = "option";
        option.innerHTML = accounts[i];
        select.append(option);
    }    
}

async function logIn(){
	header.style.display = "flex";
	divLogIn.style.display = "none";
	divMain.style.display = "flex";
	mainButtonExit.style.display = "block";

	userAccount = select.value;
	balanceWei = await web3.eth.getBalance(userAccount);
	balanceEther = await web3.utils.fromWei(balanceWei);
	accountText.innerHTML = accountText.innerHTML + " " + userAccount;
	balanceText.innerHTML = balanceText.innerHTML + " " + balanceEther;
	displayTransfers(getContract(web3, abi, contractAddress), userAccount, divMain, web3, balanceWei, balanceEther, balanceText);
}

function logOut(){
	header.style.display = "none";
	divLogIn.style.display = "flex";
	divMain.style.display = "none";
	mainButtonExit.style.display = "none";

	userAccount = null;
	balanceWei = null;

	accountText.innerHTML = accountText.innerHTML.split(" ")[0];
	balanceText.innerHTML = balanceText.innerHTML.split(" ")[0];

	while (divMain.querySelector(".transactions-history-div")){
		let divTransactionsHistory = divMain.querySelector(".transactions-history-div");
		divTransactionsHistory.remove();
	}
}

async function createTransaction(){
	const formHeader = document.createElement("h1");
	const formDialog = document.createElement("dialog");
	const form = document.createElement("form");
	const formSelect = document.createElement("select");
	const formCodeInput = document.createElement("input");
	const formAmountInput = document.createElement("input");
	const formButton = document.createElement("input");
	
	form.className = "transaction-form";
	formSelect.className = "form-select";
	formCodeInput.className = "form-input";
	formAmountInput.className = "form-input";
	formButton.className = "form-submit-button";
	
	formButton.type = "submit";
	formButton.innerHTML = "Перевести";

	formHeader.innerHTML = "Новый перевод";
	formHeader.style.alignSelf = "center";

	formCodeInput.required = true;
	formCodeInput.placeholder = "Введите кодовое слово...";

	formAmountInput.required = true;
	formAmountInput.type = "number";
	formAmountInput.min = "0.0001";
	let gasPrice = await web3.eth.getGasPrice().then();
	gasPrice = web3.utils.fromWei(gasPrice);
	formAmountInput.max = balanceEther - (Number(gasPrice) + 0.01);
	if (formAmountInput.max < 0) {
		alert("Недостаточно средств для совершения транзакции");
		return;
	}
	formAmountInput.step = "any";
	formAmountInput.placeholder = "Введите сумму перевода...";
	
	for (const account of accounts) {
		if (account != userAccount){
			const selectOption = document.createElement("option");
			selectOption.innerHTML = account;
			formSelect.append(selectOption);
		}
	}
	
	async function createTransfer(event){
		event.preventDefault();
		const gasLimit = 500000;
		if (formAmountInput.value && formCodeInput.value){
			if (Number(formAmountInput.value) <= 0) {
				alert("Значение должно быть больше нуля");
				return;
			}		
			if (Number(formAmountInput.value) > Number(formAmountInput.max)) {
				alert("Значение превышает допустимую сумму перевода");
				return;
			}	
			if (Number(formAmountInput.value) < Number(formAmountInput.min)){
				formAmountInput.value = formAmountInput.min;
			}						
			let amountEther = await web3.utils.toWei(formAmountInput.value);
			await getContract(web3, abi, contractAddress).methods.initiateTransfer(formSelect.value, formCodeInput.value).send({ from: userAccount, value: amountEther, gas: gasLimit });
			formDialog.close();
			formDialog.remove();		
		}
		else{
			alert("Поле не должно быть пустым");
		}		

		// Update transaction cards
		while (divMain.querySelector(".transactions-history-div")) {
			let divTransactionsHistory = divMain.querySelector(".transactions-history-div");
			divTransactionsHistory.remove();
		}
		displayTransfers(getContract(web3, abi, contractAddress), userAccount, divMain, web3, balanceWei, balanceEther, balanceText);
		balanceWei = await web3.eth.getBalance(userAccount);
		balanceEther = await web3.utils.fromWei(balanceWei);
		balanceText.innerHTML = balanceText.innerHTML.split(" ")[0];
		balanceText.innerHTML = balanceText.innerHTML + " " + balanceEther;

	}

	formButton.addEventListener("click", createTransfer);
	
	document.body.append(formDialog);
	formDialog.append(form);
	form.append(formHeader);
	form.append(formSelect);
	form.append(formCodeInput);
	form.append(formAmountInput);	
	form.append(formButton);
	formDialog.showModal();
}

createAccountsList();

buttonLogIn.addEventListener("click", logIn);
mainButtonExit.addEventListener("click", logOut);
mainButtonTransact.addEventListener("click", createTransaction);