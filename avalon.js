// The good to evil player ratio, indices 0-5 are total players 5-10 respectively
const playerRatio = [[3, 2], [4, 2], [4, 3], [5, 3], [6, 3], [6,4]];

// The number of players to go on each quest, indices 0-3 are total players 5-8 respectively, where 8,9,10 players have the same questNumbers
const questNumbers = [[2,3,2,3,3], [2,3,4,3,4], [2,3,3,4,4], [3,4,4,5,5]];

// A description of all the roles
const rolesDictionary = {
    "Loyal Servant of Arthur": "You are on the side of Good.",
    "Minion of Mordred": "You are on the side of Evil. The other Minions of Mordred ",
    "Merlin": "You are on the side of Good. The Minion of Mordred ",
    "Assassin": "You are on the side of Evil. The other Minions of Mordred ",
    "Percival": "You are on the side of Good. Merlin is ",
    "Mordred": "You are on the side of Evil. The other Minions of Mordred ",
    "Oberon": "You are on the side of Evil.",
    "Morgana": "You are on the side of Evil. The other Minions of Mordred "
};

// Players are the keys, roles are the values
let playerDictionary = {};

// Define some global objects
let playerNumber = 0;
let playerArray = [];
let selectedExtraRoles = [];
let shuffledElements = [];
let basicGood = 0;
let basicEvil = 0;
let goodEvilList = [];
let allEvil = []; // All evil players (shown only to Merlin)
let filteredEvils;
let oberonEvil = []; // Oberon is never in this list, this is shown to all other Evil
let filteredOberon;
let percival = []; // This contains Merlin and Morgana, if Morgana is playing
let currentIndex = 0;

// Helper function to randomly shuffle elements of an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i
      const randomIndex = Math.floor(Math.random() * (i + 1));
  
      // Swap the elements at i and randomIndex
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}

function goToNamePage() {
    const numberInput = document.getElementById('player-count');
    playerNumber = numberInput.value.trim();

    // Check if the input is not empty, is a number, and is valid
    if (playerNumber === '' || isNaN(playerNumber) || Number(playerNumber) < 5 || Number(playerNumber) > 10) {
        alert('Please enter a valid number between 5 and 10.');
        return; // Prevent moving to the next page
    }

    document.getElementById('start-page').classList.add('hidden');
    document.getElementById('name-page').classList.remove('hidden');

    const container = document.getElementById('text-inputs-container');
    container.innerHTML = ''; // Clear previous inputs, if any

    for (let i = 1; i <= playerNumber; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i}`;
        input.id = `player-${i}`;
        container.appendChild(input);
        container.appendChild(document.createElement('br')); // Add line breaks
        container.appendChild(document.createElement('br'));
    }
}

function submitNames() {
    const container = document.getElementById('text-inputs-container');
    const inputs = container.querySelectorAll('input[type="text"]');

    // Player names stored in "playerArray"
    playerArray = Array.from(inputs).map(input => input.value.trim()); 

    document.getElementById('name-page').classList.add('hidden');
    document.getElementById('extra-roles-page').classList.remove('hidden');
   
}

// ROLES
// Minions of mordred (evil) know each other
// Merlin (good) knows minions of mordred
// Assassin (evil) needs to guess Merlin
// Percival (good) knows who Merlin is
// Mordred (evil) is not known to Merlin
// Oberon (evil) is not known to other evil players and does not know the other evil players
// Morganna (evil) appears as Merlin, revealing herself to Percival as Merlin

// For 5 players, if Percival is playing, add either Mordred or Morgana
// For 5-6 players, you can add 2 extra roles
// For 7-9 players, you can add 3 extra roles
// For 10 players, you can add 4 extra roles

function compileRoles() {
    // Compile the total roles (default and extra) into an array
    // Assign extra roles (if any) and default roles to all players
    const checkboxes = document.querySelectorAll('#checkbox-form input[type="checkbox"]');
    const selectedExtraRolesClass = Array.from(checkboxes).filter(checkbox => checkbox.checked);
    selectedExtraRoles = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    let extraRolesClass = [];
    selectedExtraRolesClass.forEach(checkbox => {
        checkbox.classList.forEach(className => {
            extraRolesClass.push(className); 
        });
    });
    
    // Checks whether there were an appropriate amount of extra characters chosen
    if (playerNumber <= 6 && selectedExtraRoles.length > 2) {
        alert('You have too many roles selected, you can select a maximum of 2 roles.');
        return

    } else if (playerNumber <= 9 && selectedExtraRoles.length > 3) {
        alert('You have too many roles selected, you can select a maximum of 3 roles.');
        return

    } else { // A correct number of extra roles was chosen
        // Counts the number of Good vs Evil extra characters selected
        let goodCount = 0; // Number of extra good
        let evilCount = 0; // Number of extra evil
        
        extraRolesClass.forEach(checkbox => {
            if (checkbox == "Good") {
            goodCount++;
            goodEvilList.push("Good");
            } else if (checkbox == "Evil") {
            evilCount++;
            goodEvilList.push("Evil");
            }
        });

        goodCount++; // This takes into account Merlin
        evilCount++; // This takes into account the Assassin
        
        selectedExtraRoles.push("Merlin");
        selectedExtraRoles.push("Assassin");
        goodEvilList.push("Good");
        goodEvilList.push("Evil");
        

        // Create the final array of roles corresponding to the number of players
        // selectedExtraRoles = an array of all the roles for this game
        switch (playerNumber) {
            case "5":
                // goodCount = 0 or 1
                // evilCount = 0, 1, or 2
                basicGood = playerRatio[0][0] - goodCount;
                basicEvil = playerRatio[0][1] - evilCount;
                // Adds the remaining basic roles to the array of selected extra roles
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
            case "6":
                basicGood = playerRatio[1][0] - goodCount;
                basicEvil = playerRatio[1][1] - evilCount;
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
            case "7":
                basicGood = playerRatio[2][0] - goodCount;
                basicEvil = playerRatio[2][1] - evilCount;
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
            case "8":
                basicGood = playerRatio[3][0] - goodCount;
                basicEvil = playerRatio[3][1] - evilCount;
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
            case "9":
                basicGood = playerRatio[4][0] - goodCount;
                basicEvil = playerRatio[4][1] - evilCount;
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
            case "10":
                basicGood = playerRatio[5][0] - goodCount;
                basicEvil = playerRatio[5][1] - evilCount;
                for (let i = 0; i < basicGood; i++) {
                    selectedExtraRoles.push("Loyal Servant of Arthur");
                    goodEvilList.push("Good");
                }
                for (let i = 0; i < basicEvil; i++) {
                    selectedExtraRoles.push("Minion of Mordred");
                    goodEvilList.push("Evil");
                }
                break;
        }

    
        // Generate an array with elements [0, 2, ..., N-1], where N = the number of players
        const playerElements = Array.from({ length: playerNumber }, (_, i) => i);
        shuffledElements = shuffleArray(playerElements); // shuffledElements is a shuffled playerElements

        // Populate the dictionaries
        for (let i = 0; i < playerNumber; i++) {
            playerDictionary[playerArray[shuffledElements[i]]] = selectedExtraRoles[i];
        }

        // Populate the list of evil players
        for (let i = 0; i < playerNumber; i++) {
            if (goodEvilList[i] == "Evil") {
                allEvil.push(playerArray[shuffledElements[i]]); // All the evil players
            }
            if (goodEvilList[i] == "Evil" && selectedExtraRoles[i] != "Oberon") {
                oberonEvil.push(playerArray[shuffledElements[i]]);  // All the evil players - Oberon
            }
            if (selectedExtraRoles[i] == "Merlin" || selectedExtraRoles[i] == "Morgana") {
                percival.push(playerArray[shuffledElements[i]]); // Merlin and morgana players
            }
        }
       
        console.log(playerDictionary);
        console.log(allEvil);
        console.log(oberonEvil);
        console.log(percival);
        // We have a playerArray (the names of the players)
        // We have a selectedExtraRoles array (all the roles in the given game)
        // We have a playerDictionary which associates each player to their role
        // We have a random shuffledElements array (numbers [0 to number of players - 1] shuffled randomly), which links the player name 
        // at index 0,1,2... to the role at index shuffledElements[0], shuffledElements[1], shuffledElements[2],...
        document.getElementById('extra-roles-page').classList.add('hidden');
        document.getElementById('reveal-prompt-page').classList.remove('hidden');
    }
    
}

// Function to render the current button
function renderButton() {
    const revealContainer = document.getElementById("reveal-roles");
    revealContainer.innerHTML = ""; // Clear previous content
  
    if (currentIndex < playerNumber) {
        let thisPlayer = playerArray[currentIndex];
        const button = document.createElement("button");
        button.textContent = "I am " + thisPlayer;
        button.id = "iAmButton";
        button.addEventListener("click", showText);
        revealContainer.appendChild(button);
    } else {
        revealContainer.textContent = "All strings have been displayed!";
    }
}

// Function to show the text and add the continue button
function showText() {
    let thisPlayer = playerArray[currentIndex];
    const revealContainer = document.getElementById("reveal-roles");
    revealContainer.innerHTML = ""; // Clear previous content
  
    const roleReveal = document.createElement("p");
    const roleRules = document.createElement("p");
    const continuePrompt = document.createElement("p");
    const roleExplained = document.createElement("p");

    roleReveal.textContent = `Your role is ${playerDictionary[thisPlayer]}`;
    switch (playerDictionary[thisPlayer]) {
        case "Loyal Servant of Arthur":
            roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}`;
            break;

        case "Minion of Mordred":
            filteredOberon = oberonEvil.filter(name => name != thisPlayer);
            if (filteredOberon.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "are " + filteredOberon.join(", ");
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "is " + filteredOberon.join(", ");
            }
            break;
        case "Assassin":
            filteredOberon = oberonEvil.filter(name => name != thisPlayer);
            if (filteredOberon.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "are " + filteredOberon.join(", ");
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "is " + filteredOberon.join(", ");
            }
            roleExplained.textContent = "At the end of the game, if Good prevails, you get one last chance to win if you correctly identify Merlin."
            break;
        case "Mordred":
            filteredOberon = oberonEvil.filter(name => name != thisPlayer);
            if (filteredOberon.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "are " + filteredOberon.join(", ");
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "is " + filteredOberon.join(", ");
            }
            roleExplained.textContent = "Your identity is not revealed to Merlin."
            break;
        case "Morgana":
            filteredOberon = oberonEvil.filter(name => name != thisPlayer);
            if (filteredOberon.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "are " + filteredOberon.join(", ");
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "is " + filteredOberon.join(", ");
            }
            roleExplained.textContent = "Your special power is that you appear to be Merlin (to Percival)."
            break;

        case "Percival":
            if (percival.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + percival[0] + " or " + percival[1]; 
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + percival[0]; 
            }
            roleExplained.textContent = "Use this knowledge to protect Merlin's identity."
            break;

        case "Merlin":
            filteredEvils = allEvil.filter(name => name != thisPlayer);
            if (filteredEvils.length > 1) {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "are " + filteredEvils.join(", ");
            } else {
                roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}` + "is " + filteredEvils.join(", ");
            }
            roleExplained.textContent = "Use this knowledge to help the agents of Good. But be discreet, for if you are discovered, all will be lost..."
            break;

        case "Oberon":
            roleRules.textContent = `${rolesDictionary[playerDictionary[thisPlayer]]}`;
            break;
    }
    
    
    continuePrompt.textContent = 'Press Continue before passing to the next player';
    revealContainer.appendChild(roleReveal);
    revealContainer.appendChild(roleRules);
    revealContainer.appendChild(roleExplained);
    revealContainer.appendChild(continuePrompt);
  
    const continueButton = document.createElement("button");
    continueButton.textContent = "Continue";
    continueButton.id = "contButton";
    continueButton.addEventListener("click", () => {
      currentIndex++; // Move to the next index
      renderButton(); // Re-render the button
    });
    revealContainer.appendChild(continueButton);
}

function readyToReveal() {
    document.getElementById('reveal-prompt-page').classList.add('hidden');
    document.getElementById('reveal-roles-page').classList.remove('hidden');
    renderButton();
}