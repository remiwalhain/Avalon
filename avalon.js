// Global Constants
// The good to evil player ratio, indices 0-5 are total players 5-10 respectively
const playerRatio = [[3, 2], [4, 2], [4, 3], [5, 3], [6, 3], [6,4]];

// The number of players to go on each quest, indices 0-3 are total players 5-8 respectively, where 8,9,10 players have the same questNumbers
const questNumbers = [[2,3,2,3,3], [2,3,4,3,4], [2,3,3,4,4], [3,4,4,5,5]];

// A description of all the roles
const rolesDictionary = {
    "Loyal Servant of Arthur": "You are on the side of Good.",
    "Minion of Mordred": "You are on the side of Evil. The other Minions of Mordred ",
    "Merlin": "You are on the side of Good. The other Minions of Mordred ",
    "Assassin": "You are on the side of Evil. The other Minions of Mordred ",
    "Percival": "You are on the side of Good. Merlin is ",
    "Mordred": "You are on the side of Evil. The other Minions of Mordred ",
    "Oberon": "You are on the side of Evil.",
    "Morgana": "You are on the side of Evil. The other Minions of Mordred "
};

// Players are the keys, roles are the values
let playerDictionary = {};

// Players are the keys, Good or Bad are the values
let playerTeamDictionary = {};

// Global variables for setup
let playerNumber = 0;
let playerArray = []; // Holds the input names of all the players
let selectedExtraRoles = []; // Holds the extra roles selected
let shuffledElements = []; // Holds the shuffled order
let basicGood = 0;
let basicEvil = 0;
let goodEvilList = []; // List of all evil players
let allEvil = []; // All evil players (shown only to Merlin)
let allGood = []; // All good players
let filteredEvils;
let oberonEvil = []; // Oberon is never in this list, this is shown to all other Evil
let filteredOberon;
let percival = []; // This contains Merlin and Morgana, if Morgana is playing

// Global variables for gameplay
let currentIndex = 0;
let teamLeaderArray = []; // Array for the random shuffled order of team leaders
let playerNumbersIndex;
let selectedPlayers = []; // Players selected to go on a quest
let quest = 1; // Counter to keep track of the quest number
let questLeaderIndex = 0;
let questRejects = 0;
let questLog = []; // This tracks whether the quests passed or failed
let squareColour = ["grey", "grey", "grey", "grey", "grey"];
let questResults = [];
let playerTurn = 0; // This tracks the player index during voting phase

// ---------------------------------------------------------------------------------------------

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

// Gets the number of players and prompts that many inputs for player names
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

// Opens rules menu
function goToRulePage() {
    document.getElementById('start-page').classList.add('hidden');
    document.getElementById('rules-page').classList.remove('hidden');
}

// Closes rules menu
function returnToStartPage() {
    document.getElementById('rules-page').classList.add('hidden');
    document.getElementById('start-page').classList.remove('hidden');
}

// Submits the names to the player array
function submitNames() {
    const container = document.getElementById('text-inputs-container');
    const inputs = container.querySelectorAll('input[type="text"]');

    // Player names stored in "playerArray"
    playerArray = Array.from(inputs).map(input => input.value.trim()); 

    document.getElementById('name-page').classList.add('hidden');
    document.getElementById('extra-roles-page').classList.remove('hidden');
   
}

// // Compiles the roles (default and extra) into an array. Assigns extra roles (if any) and default roles to all players
// For 5-6 players, you can add 2 extra roles
// For 7-9 players, you can add 3 extra roles
// For 10 players, you can add 4 extra roles
function compileRoles() {
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
            playerTeamDictionary[playerArray[shuffledElements[i]]] = goodEvilList[i];
        }

        // Populate the list of all players
        for (let i = 0; i < playerNumber; i++) {
            if (goodEvilList[i] == "Evil" && selectedExtraRoles[i] != "Mordred") {
                allEvil.push(playerArray[shuffledElements[i]]); // All the evil players
            }
            if (goodEvilList[i] == "Evil" && selectedExtraRoles[i] != "Oberon") {
                oberonEvil.push(playerArray[shuffledElements[i]]);  // All the evil players - Oberon
            }
            if (selectedExtraRoles[i] == "Merlin" || selectedExtraRoles[i] == "Morgana") {
                percival.push(playerArray[shuffledElements[i]]); // Merlin and morgana players
            }
            if (goodEvilList[i] == "Good") {
                allGood.push(playerArray[shuffledElements[i]]);
            }
        }
       
        document.getElementById('extra-roles-page').classList.add('hidden');
        document.getElementById('reveal-prompt-page').classList.remove('hidden');
    }
    
}

// playerArray (the names of the players)
// selectedExtraRoles array (all the roles in the given game)
// playerDictionary which associates each player to their role
// playerTeamDictionary which associates each player to their team (good evil)
// shuffledElements array (numbers [0 to number of players - 1] shuffled randomly), which links the player name 
// at index 0,1,2... to the role at index shuffledElements[0], shuffledElements[1], shuffledElements[2],...

// Function to render the role-reveal button
function renderButton() {
    const revealContainer = document.getElementById("reveal-roles");
    revealContainer.innerHTML = ""; // Clear previous content
  
    if (currentIndex < playerNumber) {
        let thisPlayer = playerArray[currentIndex];
        const passPhone = document.createElement("h2");
        const button = document.createElement("button");
        passPhone.textContent = "Pass the phone to " + thisPlayer;
        button.textContent = "I am " + thisPlayer;
        button.id = "iAmButton";
        button.addEventListener("click", showText);
        revealContainer.appendChild(passPhone);
        revealContainer.appendChild(button);
    } else {
        document.getElementById('reveal-roles-page').classList.add('hidden');
        document.getElementById('quest-page').classList.remove('hidden');
        teamLeaderArray = [...playerArray]; // Create a shallow copy of the playerArray
        teamLeaderArray = shuffleArray(teamLeaderArray); // Randomly shuffle the order of team leaders
        initQuests();
    }
}

// Function to show the text and add the continue button
function showText() {
    let thisPlayer = playerArray[currentIndex];
    const revealContainer = document.getElementById("reveal-roles");
    revealContainer.innerHTML = ""; // Clear previous content
  
    const roleReveal = document.createElement("h2");
    const roleRules = document.createElement("p");
    const roleExplained = document.createElement("p");
    const continuePrompt = document.createElement("p");

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
            roleExplained.textContent = "Your special power is that you appear as Merlin (to Percival)."
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

    setTimeout(() => { // Set a delay for each player (each player must look at their role a minimum of 6 seconds)
        revealContainer.appendChild(continueButton);
    }, 6000);
}

function readyToReveal() {
    document.getElementById('reveal-prompt-page').classList.add('hidden');
    document.getElementById('reveal-roles-page').classList.remove('hidden');
    renderButton();
}

// Sets playerNumbersIndex to the appropriate value, then launches the quest
function initQuests() {
    switch(playerNumber) {
        case "5":
            playerNumbersIndex = 0;
        break;

        case "6":
            playerNumbersIndex = 1;
        break;

        case "7":
            playerNumbersIndex = 2;
        break;

        case "8":
        case "9":
        case "10":
            playerNumbersIndex = 3;
        break;
    }
    launchQuest();
}

// Main quest function; handles page layout, quest team voting, pass/fail phase, and quest progress
function launchQuest() {
    // Win conditions
    if (questLog.filter(item => item === "red").length == 3) {
        document.getElementById("quest-page").classList.add('hidden');
        document.getElementById("evil-victory").classList.remove('hidden');
    }
    if (questLog.filter(item => item === "green").length == 3) {
        document.getElementById("quest-page").classList.add('hidden');
        document.getElementById("assassin-phase").classList.remove('hidden');
        assassinPhase();
    }

    // For each quest, present the corresponding prompts
    const container = document.getElementById("quest-launch"); // FIX THIS LOCATION
    container.innerHTML = "";

    const checkboxContainer = document.getElementById("checkboxContainer");
    checkboxContainer.innerHTML = "";

    const container2 = document.getElementById("quest-launch-2"); 
    container2.innerHTML = "";

    const questTitle = document.createElement("h2");
    const questLeader = document.createElement("h3");
    const questText = document.createElement("p");

    // questLeaderIndex is player index because if a quest rejects, 
    // the leader is different but the quest number is the same
    questTitle.textContent = "Quest " + `${quest}`;
    questLeader.textContent = `${teamLeaderArray[questLeaderIndex % playerNumber]}` + " is the Team Leader";
    questText.textContent = "Select " + `${questNumbers[playerNumbersIndex][quest-1]}`+ " players to go on this quest";
    container.appendChild(questTitle);
    container.appendChild(questLeader);
    container.appendChild(questText);

    if (playerNumber >= 7 && quest == 4) {
        const twoFails = document.createElement("h3");
        twoFails.textContent = "Note: this quest requires 2 FAILS to fail."
        container.appendChild(twoFails);
    }

    playerArray.forEach(player => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = player;
        checkbox.name = "questTeam"; // Optional grouping name
        checkbox.value = player;

        const label = document.createElement("label");
        label.htmlFor = player;
        label.textContent = player;

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement("br"));
    });
    
    const voteInstructions = document.createElement("p");
    const rejectTeam = document.createElement("button");
    const acceptTeam = document.createElement("button");
    const spacer = document.createElement("span");
    const questProgress = document.createElement("h3");

    voteInstructions.textContent = "Vote on whether this team goes on the quest";
    rejectTeam.textContent = "Reject Team";
    rejectTeam.id = "rejectButton";
    acceptTeam.textContent = "Accept Team";
    acceptTeam.id = "acceptButton";
    spacer.textContent = "  ";
    questProgress.textContent = "Quest Progress";
    questProgress.style.position = "fixed";
    questProgress.style.bottom = "65px";
    questProgress.style.left = "50%"; 
    questProgress.style.transform = "translateX(-50%)"; 
    questProgress.style.textAlign = "center";  

    container2.appendChild(voteInstructions);
    container2.appendChild(rejectTeam);
    container2.appendChild(spacer);
    container2.appendChild(acceptTeam);
    container2.appendChild(questProgress);

    rejectTeam.addEventListener("click", () => {
        const checkboxes = checkboxContainer.querySelectorAll('input[name="questTeam"]:checked');
        checkboxes.forEach(checkbox => selectedPlayers.push(checkbox.value));
        if (questNumbers[playerNumbersIndex][quest-1] != selectedPlayers.length) {
            alert("Select exactly " + `${questNumbers[playerNumbersIndex][quest-1]}` + " players");
            selectedPlayers = [];
            launchQuest(); // Re-iterates in the while loop without changing the quest counter
        } else {
            questRejects++; // Add a reject
            document.getElementById("quest-page").classList.add('hidden');
            document.getElementById("quest-reject").classList.remove('hidden');
            rejectQuest();
            return
        }
        
    });
    
    acceptTeam.addEventListener("click", () => {
        const checkboxes = checkboxContainer.querySelectorAll('input[name="questTeam"]:checked');
        checkboxes.forEach(checkbox => selectedPlayers.push(checkbox.value));
        console.log(selectedPlayers);
        if (questNumbers[playerNumbersIndex][quest-1] != selectedPlayers.length) {
            alert("Select exactly " + `${questNumbers[playerNumbersIndex][quest-1]}` + " players");
            selectedPlayers = [];
            return // Re-iterates in the while loop without changing the quest counter
        } else {
            questRejects = 0; // Reset the reject counter
            document.getElementById("quest-page").classList.add('hidden');
            document.getElementById("quest-execute").classList.remove('hidden');
            playerTurn = 0;
            acceptQuest();
            return
        }
        
    });

    // Adding a container for the quest squares
    const squaresContainer = document.createElement("div");
    squaresContainer.style.position = "fixed"; // Sticks to the bottom of the viewport
    squaresContainer.style.bottom = "20px"; // Distance from the bottom of the screen
    squaresContainer.style.left = "50%"; // Centers the container horizontally
    squaresContainer.style.transform = "translateX(-50%)"; // Centers based on its own width
    squaresContainer.style.display = "flex"; // Arrange squares in a row
    squaresContainer.style.gap = "10px"; // Space between squares

    for (let i = 0; i < 5; i++) {
        const square = document.createElement("div");
        square.style.width = "50px"; // Width of each square
        square.style.height = "50px"; // Height of each square
        square.style.backgroundColor = squareColour[i]; // Colour
        squaresContainer.appendChild(square);
    }
      
    container2.appendChild(squaresContainer);

}

// If team is rejected for a quest
function rejectQuest() {
    if (questRejects == 5) { // If 5 consecutive teams are rejected, Evil wins
        document.getElementById("quest-reject").classList.add('hidden');
        document.getElementById("evil-victory").classList.remove('hidden');
    }
    const container = document.getElementById("quest-reject-message");
    const rejectedMessage = document.createElement("h1");
    const rejectWarning = document.createElement("h2");
    const passPhoneMessage = document.createElement("p");
    const rejectedButton = document.createElement("button");
    
    rejectedMessage.textContent = `${teamLeaderArray[questLeaderIndex % playerNumber]}` +"'s team was rejected";
    rejectWarning.textContent = "Team rejection counter: " + `${questRejects}`;
    passPhoneMessage.textContent = "Pass the phone to " + `${teamLeaderArray[(questLeaderIndex + 1) % playerNumber]}`;
    rejectedButton.textContent = "Continue";
    rejectedButton.id = "rejectedButton";
    
    container.appendChild(rejectedMessage);
    container.appendChild(rejectWarning);
    container.appendChild(passPhoneMessage);
    container.appendChild(rejectedButton);

    rejectedButton.addEventListener("click", () => {
        selectedPlayers = []; 
        questLeaderIndex++;
        container.innerHTML = "";

        document.getElementById("quest-reject").classList.add('hidden');
        document.getElementById("quest-page").classList.remove('hidden');
        launchQuest();
    })
}

// If team is accepted to go on the quest; handles pass/fail phase
function acceptQuest() {
    if (selectedPlayers.length == playerTurn) { // If each player has voted
        const seeResults = document.getElementById("quest-vote");
        seeResults.innerHTML = "";

        const revealButton = document.createElement("button");
        revealButton.textContent = "Reveal Results";
        revealButton.id = "revealButton";
        revealButton.addEventListener("click", () => {
            document.getElementById("quest-execute").classList.add('hidden');
            document.getElementById("quest-results").classList.remove('hidden');
            displayResults();
        });
        seeResults.appendChild(revealButton);
        
    } else {
        const voteContainer = document.getElementById("quest-vote");
        voteContainer.innerHTML = ""; 

        const passPhone = document.createElement("h2");
        const passButton = document.createElement("button");
        const buttonWrapper = document.createElement("div"); // Wrapper for buttons
        const failButton = document.createElement("button");
        const confirmButton = document.createElement("button");

        passPhone.textContent = "Pass the phone to " + `${selectedPlayers[playerTurn]}`;
        passButton.textContent = "PASS";
        passButton.id = "passButton";
        failButton.textContent = "FAIL";
        failButton.id = "failButton";
        confirmButton.textContent = "CONFIRM";
        confirmButton.id = "confirmButton";
        confirmButton.style.display = "none"; // Initially hidden
        confirmButton.style.borderRadius = "10px";
        confirmButton.style.margin = "20px auto 0"; // Top margin + auto centering
        confirmButton.style.textAlign = "center";
        confirmButton.style.alignSelf = "center";
        
        // Add styles to the wrapper for proper alignment
        buttonWrapper.style.display = "flex";
        buttonWrapper.style.justifyContent = "center"; // Center the buttons horizontally
        buttonWrapper.style.gap = "50px"; // Add space between buttons

        let selection = null;

        passButton.addEventListener("click", () => {
            passButton.style.border = "3px solid green";
            failButton.style.border = "none";
            selection = "pass";
            confirmButton.style.display = "block";
        });

        failButton.addEventListener("click", () => {
            failButton.style.border = "3px solid red";
            passButton.style.border = "none";
            selection = "fail";
            confirmButton.style.display = "block";
        });

        confirmButton.addEventListener("click", () => {
            const player = selectedPlayers[playerTurn];
            const role = playerTeamDictionary[player];
        
            if (selection === "pass") {
                questResults.unshift("green"); // Always at the start
            } else if (selection === "fail") {
                if (role === "Good") {
                    questResults.unshift("green"); // Good players can't fail
                } else {
                    questResults.push("red"); // Fails at end
                }
            }
        
            playerTurn++;
            acceptQuest();
        });

        buttonWrapper.appendChild(passButton);
        buttonWrapper.appendChild(failButton);
        buttonWrapper.appendChild(confirmButton);
        voteContainer.appendChild(passPhone);
        voteContainer.appendChild(buttonWrapper);
        voteContainer.appendChild(confirmButton);
    }
}

// Displays the quest results, with a time delay
function displayResults() {
    const recContainer = document.createElement("div");
    recContainer.style.position = "fixed"; // Sticks to the top of the viewport
    recContainer.style.top = "100px"; // Distance from the top of the screen
    recContainer.style.left = "50%"; // Centers the container horizontally
    recContainer.style.transform = "translateX(-50%)"; // Centers based on its own width
    recContainer.style.display = "flex"; 
    recContainer.style.flexDirection = "column"; // Arrange rectangles on top of each other
    recContainer.style.gap = "10px"; // Space between rectangles

    document.body.appendChild(recContainer);

    for (let i = 0; i < selectedPlayers.length; i++) {
        setTimeout(() => {
            const rectangle = document.createElement("div");
            rectangle.style.width = "300px"; // Width of each rectangle
            rectangle.style.height = "50px"; // Height of each rectangle
            rectangle.style.backgroundColor = questResults[i]; // Colour
            recContainer.appendChild(rectangle);
        }, 2000 + i * 1500); // Delay increases by 1 second for each box
    }

    const totalDelay = 3000 + (selectedPlayers.length - 1) * 1500;

    if (playerNumber >= 7 && quest == 4) { // If this is the quest that requires two fails
        if (questResults.filter(item => item === "red").length >= 2) {
            questLog.push("red");
        } else {
            questLog.push("green");
        }
    } else { // If this is a regular quest
        if (questResults.includes("red")) { // Udates the questLog
            questLog.push("red");
        } else {
            questLog.push("green");
        }
    }

    setTimeout(() => {
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Continue";
        confirmButton.id = "confirmButton"
        recContainer.appendChild(confirmButton);
        confirmButton.addEventListener("click", () => {
            squareColour[quest-1] = questLog[quest-1];
            quest++; // Update to next quest
            selectedPlayers = []; // Empties selectedPlayers
            questResults = []; // Empties questResults
            recContainer.innerHTML = ""; // Clears current container

            document.getElementById('quest-results').classList.add('hidden');
            document.getElementById('quest-page').classList.remove('hidden');
            questLeaderIndex++;
            launchQuest();
        });
    }, totalDelay);
}

// If good passes three quests
function assassinPhase() {
    const container = document.getElementById("assassin-choices");
    container.innerHTML = "";

    for (let i = 0; i < playerRatio[playerNumber-5][0]; i++) {
        const button = document.createElement('button');
        button.textContent = `${allGood[i]}`;
        button.addEventListener("click", () => {
            if (playerDictionary[allGood[i]] == "Merlin") {
                document.getElementById("assassin-phase").classList.add('hidden');
                document.getElementById("evil-victory").classList.remove('hidden');
            } else {
                document.getElementById("assassin-phase").classList.add('hidden');
                document.getElementById("good-victory").classList.remove('hidden');
            }
        });

        container.appendChild(button);
        container.appendChild(document.createElement('br')); // Add line breaks
        container.appendChild(document.createElement('br'));
    }

    
}

