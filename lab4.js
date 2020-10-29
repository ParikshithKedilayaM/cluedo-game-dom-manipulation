// const cluedo = {
//     rooms: ['Kitchen', 'Study', 'Living Room', 'Dining Room', 'Library'],
//     suspects: ['Mrs. Peacock', 'Mrs. Green', 'Miss Scarlet', 'Colonel Mustard', 'Professor Plum'],
//     weapons: ['Pistol', 'Knife', 'Wrench', 'Lead Pipe', 'Candlestick']
// };
const cluedo = {
    rooms: ["Kitchen", "Ballroom", "Conservatory", "Billiard Room", "Library", "Study", "Hall", "Lounge", "Dining Room"],
    suspects: ["Mrs. Peacock", "Mrs. Green", "Miss Scarlet", "Colonel Mustard", "Professor Plum", "Mrs. White"],
    weapons: ["Pistol", "Knife", "Wrench", "Lead Pipe", "Candlestick", "Rope"]
};

function getNameAndShowGuess() {
    var username = document.getElementById("name").value;
    sessionStorage.setItem('_username', username);
    let data = shuffle();
    document.getElementById("userDetails").innerHTML = `Welcome ${username}, You hold the cards for ${data.userCards.join(', ')}`;
    enableGuess();
    sessionStorage.setItem(username, JSON.stringify(data));
    deleteUserAssignedOptions(username);
}

function initialize() {
    setDisplaySet();
    resetDropdown();
    newGame();
    addListeners();
}

function addListeners() {
    document.getElementById('historyBtn').addEventListener('click', () => {
        if (document.getElementById('historyBtn').value === 'Show History') {
            showHistory();
        } else {
            hideHistory();
        }
    });
    document.getElementById('recordBtn').addEventListener('click', () => {
        if (document.getElementById('recordBtn').value === 'Show Record') {
            showRecord();
        } else {
            hideRecord();
        }
    });
}

function setDisplaySet() {
    var text = `Rooms: ${cluedo.rooms.join(', ')}<br> \nGuests: ${cluedo.suspects.join(', ')}<br> \nWeapons: ${cluedo.weapons.join(', ')}<br> \n`;
    document.getElementById('displaySet').innerHTML = text;
}

function resetDropdown() {
    setOptions(cluedo.rooms, 'rooms');
    setOptions(cluedo.suspects, 'suspects');
    setOptions(cluedo.weapons, 'weapons');
}

function setOptions(items, itemName) {
    var options = "";
    for (let item of items) {
        options += `<option value="${item}">${item}</option> \n`;
    }
    document.getElementById(itemName).innerHTML = options;
}

function guess() {
    var userdata = sessionStorage.getItem(getUsername());
    var dataObj = JSON.parse(userdata);
    var secretTriple = dataObj.secretTriple;
    var userGuessRoom = document.getElementById('rooms').value;
    var userGuessSuspects = document.getElementById('suspects').value;
    var userGuessWeapons = document.getElementById('weapons').value;
    pushHistory(getUsername(), userGuessRoom, userGuessSuspects, userGuessWeapons);
    var {res, card} = validateResponse(userGuessRoom, userGuessSuspects, userGuessWeapons, secretTriple)
    if (res) {
        displaySuccessMessage(userGuessRoom, userGuessSuspects, userGuessWeapons);
        addRecord(true);
    } else {
        displayIncorrectMessage(card);
    }
    disableGuess();
}

function validateResponse(guessRoom, guessSuspects, guessWeapons, secretTriple) {
    if (guessRoom !== secretTriple.rooms) {
        return {res: false, card: guessRoom};
    } 
    if (guessSuspects !== secretTriple.suspects) {
        return {res: false, card: guessSuspects};
    } 
    if (guessWeapons !== secretTriple.weapons) {
        return {res: false, card: guessWeapons};
    }
    return {res: true, card: ''};
}

function displayIncorrectMessage(computerCard) {
    var message = getMessageTag();
    message.innerText = `Sorry that was an incorrect guess! The Computer holds the card for ${computerCard}\nClick to continue: `;
    var continueBtn = document.createElement('BUTTON');
    continueBtn.setAttribute('type', 'button');
    continueBtn.setAttribute('onclick', 'computerMove()');
    continueBtn.innerHTML = 'Continue';
    message.appendChild(continueBtn);
    
}

function displaySuccessMessage(room, suspect, weapon) {
    var message = getMessageTag();
    message.innerText = `That was the correct guess! ${suspect} did it with the ${weapon} in the ${room}!\nClick to start a new game: `;
    var newGameBtn = document.createElement('BUTTON');
    newGameBtn.setAttribute('type', 'button');
    newGameBtn.setAttribute('onclick', 'newGame()');
    newGameBtn.innerHTML = 'New Game';
    message.appendChild(newGameBtn);
}

function getMessageTag() {
    var messageTag = document.getElementById('messageTxt');
    if (messageTag == undefined || messageTag == null) {
        var message = document.createElement('p');
        message.setAttribute('id', 'messageTxt');
        document.getElementById('userForm').after(message);
        messageTag = document.getElementById('messageTxt');
    }
    return messageTag;
}

function shuffle() {
    var [rooms, suspects, weapons] = [[...cluedo.rooms], [...cluedo.suspects], [...cluedo.weapons]];
    shuffleArray(rooms);
    shuffleArray(suspects);
    shuffleArray(weapons);
    var secretTriple = { rooms: rooms.pop().toString(), suspects: suspects.pop().toString(), weapons: weapons.pop().toString() };
    var userCards = [], computerCards = [];
    assignCards(rooms, userCards, computerCards);
    assignCards(suspects, userCards, computerCards);
    assignCards(weapons, userCards, computerCards);
    return { userCards, computerCards, secretTriple };
}

function assignCards(items, userCards, computerCards) {
    for (let i = 0; i < items.length; i++) {
        if (i % 2 === 0) {
            userCards.push(items[i]);
        } else {
            computerCards.push(items[i]);
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function deleteUserAssignedOptions(username) {
    var data = sessionStorage.getItem(username);
    var dataObj = JSON.parse(data);
    deleteOptions(document.getElementById("rooms"), dataObj.userCards);
    deleteOptions(document.getElementById("suspects"), dataObj.userCards);
    deleteOptions(document.getElementById("weapons"), dataObj.userCards);
}

function deleteOptions(items, userCards) {
    for (let option of items.childNodes) {
        if (userCards.includes(option.innerHTML)) {
            option.remove();
        }
    }
}

function enableGuess() {
    document.getElementById("guessBtn").removeAttribute("disabled");
}

function disableGuess() {
    document.getElementById("guessBtn").setAttribute('disabled', 'true');
}

function userMove() {
    document.getElementById('messageTxt').remove();
    enableGuess();
}

function computerMove() {
    var {secretTriple, room, suspect, weapon} = computerGuess();
    var computerMessage = getMessageTag();
    computerMessage.innerText = `The Computer guessed "${suspect} in the ${room} with a ${weapon}"\n`;
    pushHistory('Computer', room, suspect, weapon);
    var {res, card} = validateResponse(room, suspect, weapon, secretTriple);
    if (res) {
        correctGuess(computerMessage);
    } else {
        incorrectGuess(computerMessage, card);
    }
}

function incorrectGuess(computerMessage, card) {
    computerMessage.innerText += `The Computer made an incorrect guess! You holds the card for ${card}.\nClick to continue: `
    var continueBtn = document.createElement('BUTTON');
    continueBtn.setAttribute('type', 'button');
    continueBtn.setAttribute('onclick', 'userMove()');
    continueBtn.innerHTML = 'Continue';
    computerMessage.appendChild(continueBtn);
} 

function correctGuess(computerMessage) {
    computerMessage.innerText += `The Computer made the correct guess!\nClick to start a new game: `
    var continueBtn = document.createElement('BUTTON');
    continueBtn.setAttribute('type', 'button');
    continueBtn.setAttribute('onclick', 'newGame()');
    continueBtn.innerHTML = 'New Game';
    computerMessage.appendChild(continueBtn);
    addRecord();
}

function computerGuess() {
    var userdata = sessionStorage.getItem(getUsername());
    var dataObj = JSON.parse(userdata);
    return {
        secretTriple : dataObj.secretTriple,
        room : randomGuessGenerator(cluedo.rooms, dataObj.computerCards),
        suspect : randomGuessGenerator(cluedo.suspects, dataObj.computerCards),
        weapon : randomGuessGenerator(cluedo.weapons, dataObj.computerCards)
    }
}

function randomGuessGenerator(items, computerCards) {
    var randomItem = "";
    do {
        randomItem = items[getRandomInt(items.length)];
    } while (computerCards.includes(randomItem));
    return randomItem;
}

function newGame() {
    var messageTag = document.getElementById('messageTxt');
    if (messageTag !== null) {
        messageTag.remove();
    }
    var form = document.createElement('form');
    form.innerText = 'Name: '
    
    var inputName = document.createElement('input');
    inputName.setAttribute('type', 'text');
    inputName.setAttribute('placeholder', 'name here');
    inputName.setAttribute('value', '');
    inputName.setAttribute('id', 'name');
    inputName.setAttribute('autofocus', 'true');
    inputName.setAttribute('required', 'true');

    var submitbtn = document.createElement('button');
    submitbtn.setAttribute('type', 'button');
    submitbtn.setAttribute('value', 'Enter');
    submitbtn.innerText = 'Enter';
    submitbtn.setAttribute('onclick', 'getNameAndShowGuess()');

    form.appendChild(inputName);
    form.appendChild(submitbtn);

    document.getElementById("userDetails").innerHTML = '';
    document.getElementById("userDetails").appendChild(form);
    disableGuess();
    resetDropdown();
    clearHistory();
}

function showHistory() {
    document.getElementById('historyBtn').setAttribute('value', 'Hide History');
    renderHistory();
}

function renderHistory() {
    var lHistory = sessionStorage.getItem('_lHistory');
    if (lHistory === undefined || lHistory === null) {
        lHistory = [];
    } else {
        lHistory = JSON.parse(lHistory);
    }
    for ({user, room, suspect, weapon} of lHistory) {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');

        td1.innerText = user;
        td2.innerText = `"${suspect} in the ${room} with a ${weapon}"`;

        tr.appendChild(td1);
        tr.appendChild(td2);
        document.getElementById('historySection').appendChild(tr);
    }
}

function hideHistory() {
    document.getElementById('historyBtn').setAttribute('value', 'Show History');
    document.getElementById('historySection').innerHTML = '';
}

function pushHistory(user, room, suspect, weapon) {
    var lHistory = sessionStorage.getItem('_lHistory');
    if (lHistory === undefined || lHistory === null) {
        lHistory = [];
    } else {
        lHistory = JSON.parse(lHistory);
    }
    lHistory.push({user, room, suspect, weapon});
    sessionStorage.setItem('_lHistory', JSON.stringify(lHistory));
}

function clearHistory() {
    sessionStorage.clear();
}

function getUsername() {
    return sessionStorage.getItem('_username');
}

function showRecord() {
    document.getElementById('recordBtn').setAttribute('value', 'Hide Record');
    var cHistory = getDataFromLS();
    var totalGamesPlayed = cHistory.length;
    var computerWinningCount = 0;
    var index = 1;
    for (let {user, isComputerWin, date} of cHistory) {
        if (isComputerWin) computerWinningCount++;
        var record = document.createElement('span');
        record.innerText = `${index++}. ${user} ${isComputerWin?'lost':'won'} on ${new Date(date)}\n`
        document.getElementById('recordSection').appendChild(record);
    }
    document.getElementById('stats').innerText = `Win-Loss record for Computer: ${computerWinningCount}-${totalGamesPlayed-computerWinningCount}`;
}

function hideRecord() {
    document.getElementById('recordBtn').setAttribute('value', 'Show Record');
    document.getElementById('recordSection').innerHTML = '';
    document.getElementById('stats').innerHTML = '';
}

function addRecord(user) {
    var cHistory = getDataFromLS();
    cHistory.push({user: getUsername(), isComputerWin: !user, date: new Date()});
    localStorage.setItem('_computer-history', JSON.stringify(cHistory));
}

function getDataFromLS() {
    var cHistory = localStorage.getItem('_computer-history');
    if (cHistory === undefined || cHistory === null) {
        cHistory = [];
    } else {
        cHistory = JSON.parse(cHistory);
    }
    return cHistory;
}