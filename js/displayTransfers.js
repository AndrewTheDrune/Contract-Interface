export async function displayTransfers(myContract, userAccount, divMain, web3){
	let transfersArrayLength = await myContract.methods.getTransferRequestsLength().call();

	for (let i = transfersArrayLength - 1; i >= 0; i--) {
		let transactionsHistoryObject = await myContract.methods.transferRequests(i).call();

        const divTransactionsHistory = document.createElement("div");
		divTransactionsHistory.className = "transactions-history-div";
		divTransactionsHistory.id = i;

        // address: from/to
        const transactionsListAccountTitle = document.createElement("h3");
		transactionsListAccountTitle.className = "transactions-list-title";
		const transactionsListAccountText = document.createElement("h3");
		transactionsListAccountText.className = "transactions-list-text";

        // uint: amount
        const transactionsListAmountTitle = document.createElement("h3");
		transactionsListAmountTitle.className = "transactions-list-title";
		const transactionsListAmountText = document.createElement("h3");
		transactionsListAmountText.className = "transactions-list-text";
        		
		transactionsListAmountTitle.innerHTML = "Сумма перевода:";
		let amountEther = await web3.utils.fromWei(transactionsHistoryObject.amount);
		transactionsListAmountText.innerHTML = amountEther;

        // bool codeWordConfirmed
        const transactionsListCodeConfirmTitle = document.createElement("h3");
		transactionsListCodeConfirmTitle.className = "transactions-list-title";
		const transactionsListCodeConfirmText = document.createElement("h3");
		transactionsListCodeConfirmText.className = "transactions-list-text";
		transactionsListCodeConfirmTitle.innerHTML = "Статус перевода:";

		if (userAccount == transactionsHistoryObject.to){
    		divMain.append(divTransactionsHistory);

			// address: from			
			transactionsListAccountTitle.innerHTML = "Отправитель:";
			transactionsListAccountText.innerHTML = transactionsHistoryObject.from;
			divTransactionsHistory.append(transactionsListAccountTitle, transactionsListAccountText);
			
            // uint: amount
            divTransactionsHistory.append(transactionsListAmountTitle, transactionsListAmountText);

			// bool codeWordConfirmed
			divTransactionsHistory.append(transactionsListCodeConfirmTitle);
			
            // bool canceled
		    if (transactionsHistoryObject.canceled) {
		    	const transactionsListCanceledText = document.createElement("h3");
		    	transactionsListCanceledText.className = "transactions-list-text";
		    	transactionsListCanceledText.innerHTML = "Перевод отменён";
		    	divTransactionsHistory.style.backgroundColor = "rgb(185, 185, 185)";
		    	divTransactionsHistory.style.boxShadow = "0 0 35px rgb(185, 185, 185)";
		    	divTransactionsHistory.append(transactionsListCanceledText);
		    }

			if (!transactionsHistoryObject.canceled){
				if (transactionsHistoryObject.codeWordConfirmed) {
					transactionsListCodeConfirmText.innerHTML = "Подтверждён";
					divTransactionsHistory.style.backgroundColor = "rgb(123, 238, 139)";
					divTransactionsHistory.style.boxShadow = "0 0 35px rgb(123, 255, 139)";
				}
				else {
					transactionsListCodeConfirmText.innerHTML = "Ожидает подтверждения";
				}
				divTransactionsHistory.append(transactionsListCodeConfirmText);
				
				// codeWordConfirm
				let transfer = await myContract.methods.transferRequests(divTransactionsHistory.id).call();
				if (!transfer.codeWordConfirmed){				
					const formConfirm = document.createElement("form");
					const formInput = document.createElement("input");
					const buttonConfirm = document.createElement("button");
					
					formConfirm.className = "confirm-form";
					
					buttonConfirm.className = "card-button";
					buttonConfirm.innerHTML = "Подтвердить перевод";
					buttonConfirm.style.display = "none";
					
					formInput.className = "confirm-input";
					formInput.placeholder = "Введите кодовое слово...";
					formInput.style.display = "none";
					
					divTransactionsHistory.append(formConfirm);
					formConfirm.append(formInput);
					formConfirm.append(buttonConfirm);
					
					divTransactionsHistory.addEventListener("click", function(){
					buttonConfirm.style.display = getComputedStyle(buttonConfirm).display == "block" ? "none" : "block";
					formInput.style.display = getComputedStyle(formInput).display == "block" ? "none" : "block";
                    });	               

				    formInput.addEventListener("click", function(event){
				    	event.stopPropagation();
				    });
                
				    async function confirmTransaction(event){
				    	event.preventDefault();
				    	event.stopPropagation();
                        
                        if (transfer.codeWord == formInput.value) {                            
                            const gasLimit = 500000;
                            await myContract.methods.confirmTransfer(divTransactionsHistory.id, formInput.value).send({ from: userAccount, value: transfer.amount, gas: gasLimit });
                        }
                    
				    	// Update transaction cards
				    	// let transactionCards = divMain.getElementsByClassName("transactions-history-div");
				    	// for (let card = 0; i < transactionCards.length; i++) {
				    	// 	card.remove();
				    	// 	console.log(card.id)						
				    	// }
				    }			
				    buttonConfirm.addEventListener("click", confirmTransaction);
                }
            }
		}		
		else if (userAccount == transactionsHistoryObject.from) {
    		divMain.append(divTransactionsHistory);

			// address: to
			transactionsListAccountTitle.innerHTML = "Получатель:";
			transactionsListAccountText.innerHTML = transactionsHistoryObject.to;
			divTransactionsHistory.append(transactionsListAccountTitle, transactionsListAccountText);

            // uint: amount
            divTransactionsHistory.append(transactionsListAmountTitle, transactionsListAmountText);
            
			// bool codeWordConfirmed
			divTransactionsHistory.append(transactionsListCodeConfirmTitle);
			
			if (!transactionsHistoryObject.canceled) {				
				if (transactionsHistoryObject.codeWordConfirmed) {
					transactionsListCodeConfirmText.innerHTML = "Подтверждён";
					divTransactionsHistory.style.backgroundColor = "rgb(123, 238, 139)";
					divTransactionsHistory.style.boxShadow = "0 0 35px rgb(123, 255, 139)";
				}
				else {
					transactionsListCodeConfirmText.innerHTML = "Ожидает подтверждения";
				}

				divTransactionsHistory.append(transactionsListCodeConfirmText);
			}

            // bool canceled
		    if (transactionsHistoryObject.canceled) {
		    	const transactionsListCanceledText = document.createElement("h3");
		    	transactionsListCanceledText.className = "transactions-list-text";
		    	transactionsListCanceledText.innerHTML = "Перевод отменён";
		    	divTransactionsHistory.style.backgroundColor = "rgb(185, 185, 185)";
		    	divTransactionsHistory.style.boxShadow = "0 0 35px rgb(185, 185, 185)";
		    	divTransactionsHistory.append(transactionsListCanceledText);
		    }

			// buttonCancel
			let transfer = await myContract.methods.transferRequests(divTransactionsHistory.id).call();
			if (!transfer.canceled && !transfer.codeWordConfirmed) {
				const buttonCancel = document.createElement("button");
				buttonCancel.className = "card-button";
				buttonCancel.innerHTML = "Отменить перевод";
				buttonCancel.style.display = "none";
				divTransactionsHistory.append(buttonCancel);

				divTransactionsHistory.addEventListener("click", function () {
					buttonCancel.style.display = getComputedStyle(buttonCancel).display == "block" ? "none" : "block";
				});

				async function cancelTransfer(event){
					event.stopPropagation();
					event.preventDefault();

					const gasLimit = 500000;
					await myContract.methods.cancelTransaction(divTransactionsHistory.id).send({ from: userAccount, value: transfer.amount, gas: gasLimit });
					console.log(divTransactionsHistory.id);
					console.log(transfer.amount);

				}
				buttonCancel.addEventListener("click", cancelTransfer);
			}
		}
	}
}