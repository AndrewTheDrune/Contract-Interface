export async function createTransaction(balanceEther){
	const formHeader = document.createElement("h1");
	const formDialog = document.createElement("dialog");
	const form = document.createElement("form");
	const formSelect = document.createElement("select");
	const formCodeInput = document.createElement("input");
	const formAmountInput = document.createElement("input");
	const formButton = document.createElement("button");
	
	form.className = "transaction-form";
	formSelect.className = "form-select";
	formCodeInput.className = "form-input";
	formAmountInput.className = "form-input";
	formButton.className = "form-submit-button";
	
	formButton.innerHTML = "Перевести";

	formHeader.innerHTML = "Новый перевод";
	formHeader.style.alignSelf = "center";

	formCodeInput.required = true;
	formCodeInput.placeholder = "Введите кодовое слово...";

	formAmountInput.required = true;
	formAmountInput.type = "number";
	formAmountInput.min = "0.1";
	formAmountInput.max = balanceEther;
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
		const gasLimit = 5000000;
		console.log(Number(balanceEther));
		console.log(Number(formAmountInput.value));
		console.log(Number(formAmountInput.value) > Number(balanceEther));


		if (formAmountInput.value > 0){
			if (Number(formAmountInput.value) > Number(balanceEther)){
				console.log('amaut', formAmountInput.value);
				console.log('hkjhukhujk',balanceEther);
				formAmountInput.value = balanceEther;
			}
			else{

				let amountEther = await web3.utils.toWei(formAmountInput.value);
				getContract().methods.initiateTransfer(formSelect.value, formCodeInput.value).send({ from: userAccount, value: amountEther, gas: gasLimit});
				formDialog.close();	
				formDialog.remove();
			}
			
		}
		else{
			alert("Поле не должно быть пустым");
		}		

		// Update transaction cards
		// let transactionCards = divMain.getElementsByClassName("transactions-history-div");
		// for (let card = 0; card < transactionCards.length; card++) {
		// 	transactionCards[card].remove();
		// 	console.log(transactionCards[card])
		// }
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