import gameRules from './gameRules.json' with { type: 'json' };

// retrieve html elements
const myModal = new bootstrap.Modal(document.getElementById('mainModal'));
const modalHeader = document.querySelector('.modal-header');
const modalBody = document.querySelector('.modal-body');
const diffContainer = document.querySelector('#difficulty-container');
const gameModeContainer = document.querySelector('#game-mode-container');
const wordLengthContainer = document.querySelector('#word-length-container');
const diffSelected = document.querySelector('#difficulty-choice');
const diffMessageP = document.querySelector('.difficulty-message');
const modeSelected = document.querySelector('#game-mode-choice');
const modeMessageP = document.querySelector('.game-mode-message');
const wordLengthSelected = document.querySelector('#word-length-choice');
const wordLengthMessageP = document.querySelector('.word-length-message');
const btnWithBigThingsToDo = document.querySelector('#btn-with-big-things-to-do');
const board = document.querySelector('.board');
const keyboardKey = document.querySelectorAll('.keyboard-key');
const modalMessage = document.createElement('div');
modalBody.prepend(modalMessage);
let numberOfKeyPushed = 0;
let playerWord = '';
let currentWordLength = 0;
let totalPossibleAttemps = 0;
let currentAttemp = 1;
let currentRound = 1;
let totalRounds = 0;
let correctLetters = {};
let score = 0;
let correctLettersPerAttempt = [];
let wrongLettersPerAttempt = [];
let scorePerRound = [];
let startTime = 0;
let elapsedTime = 0;
let totalElapsedTime = 0;
const totalAllowedTime = 300;
let randWord = ''

if (!localStorage.getItem('leaderboard')) {
    const initialLeaderboard = [
        { playerPseudo: 'Bidule', bestScore: 100 },
        { playerPseudo: 'Machin', bestScore: 150 },
        { playerPseudo: 'Truc', bestScore: 80 },
        { playerPseudo: 'Bizarre', bestScore: 200 },
        { playerPseudo: 'Génial', bestScore: 120 }
    ];
    localStorage.setItem('leaderboard', JSON.stringify(initialLeaderboard));
}

const startTimer = () => {
    startTime = Date.now();
};

const stopTimer = () => {
    elapsedTime = (Date.now() - startTime) / 1000;
    totalElapsedTime += elapsedTime;
};

const calculateFinalScoreWithBonus = () => {
    const timeUsedPercentage = totalElapsedTime / totalAllowedTime;
    const remainingTimePercentage = 1 - timeUsedPercentage;
    const bonusScore = score * remainingTimePercentage;
    const newScore = bonusScore + score;
    score = Math.round(newScore);
};

// Sélectionner un mot aléatoire
const randomWord = async (wordLength) => {
    try {
        const response = await fetch(`https://trouve-mot.fr/api/size/${wordLength}`);
        const words = await response.json();
        return words;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

const handleRandomWord = async (wordSize) => {
    const wordLength = Number(wordSize);
    if (isNaN(wordLength) || wordLength <= 0) {
        console.error('Longueur du mot non valide');
        return;
    }

    const words = await randomWord(wordLength);
    if (words.length > 0) {
        randWord = words[0].name.toUpperCase();
        console.log('Mot aléatoire:', randWord);
    } else {
        console.error('Aucun mot trouvé pour cette longueur');
    }
};



// Mise en place du layout du jeu
const wordRowLayout = (wordLength, currentAttemp, result) => {
    const word = document.createElement('div');
    word.classList.add('word');
    word.classList.add(`current-attempt-${currentAttemp}`)
    word.innerHTML = '';
    numberOfKeyPushed = 0;
    playerWord = '';
    board.appendChild(word);
    for (let i = 0; i < parseInt(wordLength); i++) {
        const div = document.createElement('div');
        const span = document.createElement('span');
        div.appendChild(span);
        div.classList.add('letter');
        div.classList.add(`letter-${i}`);
        if(Object.keys(correctLetters).length > 0) {
            if(correctLetters[i]) {
                span.innerHTML = correctLetters[i];
                div.classList.add('correct');
            }
        } else {
            span.innerHTML  = '.';
        }
        word.appendChild(div);
    }
    return word;
};

const resetLayout = () => {
    numberOfKeyPushed = 0;
    playerWord = '';
    currentWordLength = 0;
    totalPossibleAttemps = 0;
    currentAttemp = 1;
    currentRound = 1;
    totalRounds = 0;
    correctLetters = {};
    randWord = '';
    board.textContent = '';
    score = 0;
    correctLettersPerAttempt = [];
    wrongLettersPerAttempt = [];
    scorePerRound = [];
    totalElapsedTime = 0;


    keyboardKey.forEach(key => {
        key.classList.remove('btn-danger');
        key.classList.remove('btn-warning');
        key.disabled = false;
    }
    );

    diffContainer.classList.remove('d-none');
    gameModeContainer.classList.remove('d-none');
    wordLengthContainer.classList.remove('d-none');

};

const prepareLayoutForNextRound = () => {
    stopTimer();
    modalHeader.textContent = 'Bravo !';
    btnWithBigThingsToDo.innerHTML = 'Manche Suivante';
    modalMessage.innerHTML = `<p style="font-style:italic;">Bravo ! Vous avez trouvé le mot !</p>`;
    diffContainer.classList.add('d-none');
    gameModeContainer.classList.add('d-none');
    wordLengthContainer.classList.add('d-none');
    const nexRoundWordLength = randWord.length === 9 ? 9 : randWord.length + 1;
    handleRandomWord(nexRoundWordLength);

    correctLettersPerAttempt = [];
    wrongLettersPerAttempt = [];
    const newWordLength = nexRoundWordLength;
    board.textContent = '';
    numberOfKeyPushed = 0;
    playerWord = '';
    currentWordLength = 0;
    currentAttemp = 1;
    correctLetters = {};

    keyboardKey.forEach(key => {
        key.classList.remove('btn-danger');
        key.classList.remove('btn-warning');
        key.disabled = false;
    }
    );


    wordRowLayout(newWordLength, currentAttemp);
    myModal.show();
    currentRound++;

}

// Update Settings message function
const updateBoardSettings = () => {
    stopTimer();
    resetLayout();
    const selectedDifficulty = gameRules.difficulty[diffSelected.value];
    const selectedMode = gameRules.modes[modeSelected.value];
    const diffMessage = `En mode ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const modeMessage = `${selectedMode.description} En difficulté ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const wordLengthMessage = `Vous devez trouver un mot de ${wordLengthSelected.value} lettres.`;
    randWord = handleRandomWord(wordLengthSelected.value)

    diffMessageP.textContent = diffMessage;
    modeMessageP.textContent = modeMessage;
    wordLengthMessageP.textContent = wordLengthMessage;

    const newWordLength = parseInt(wordLengthSelected.value);
    const newTotalPossibleAttemps = selectedDifficulty.attempts;
    const newRound = selectedMode.rounds;

    if (newWordLength !== currentWordLength) {
        currentWordLength = newWordLength;
        randWord = handleRandomWord(currentWordLength)
    }

    if (newTotalPossibleAttemps !== totalPossibleAttemps) {
        totalPossibleAttemps = newTotalPossibleAttemps;
    }

    if (newRound !== totalRounds) {
        totalRounds = newRound;
    }

    wordRowLayout(newWordLength, currentAttemp);
    displayGameInfo();
};

// Récupérer le bouton pousser pour la lettre
const pushKey = (e) => {
    const regex = /^\p{L}$/u;
    if (startTime === 0) {
        startTimer();
    }
    const pressedKey = e.key.toUpperCase();
    const word = document.querySelector(`.current-attempt-${currentAttemp}`);
    if (regex.test(pressedKey)) {
        if(numberOfKeyPushed < randWord.length) {
            if(Object.keys(correctLetters).length > 0) {
                if(correctLetters[numberOfKeyPushed]) {
                    word.children[numberOfKeyPushed].children[0].textContent = correctLetters[numberOfKeyPushed];
                    playerWord += correctLetters[numberOfKeyPushed];
                    return numberOfKeyPushed++;
                }
            }
            word.children[numberOfKeyPushed].children[0].textContent = pressedKey;
            playerWord += word.children[numberOfKeyPushed].children[0].textContent;
            return numberOfKeyPushed++;
        }
    }
};
// Vérifier le mot
const checkWord = (e) => {
    if(numberOfKeyPushed === randWord.length) {
        compareWords(playerWord, randWord);
        if(playerWord === randWord.toUpperCase()) {
            // GAGNÉ : Gestion des victoires par manche
            let roundScore = calculateScore();
            scorePerRound.push(roundScore);
            score += roundScore;
            if(currentRound < totalRounds) {
                // GAGNÉ : Une seule manche
                prepareLayoutForNextRound();
                displayGameInfo();
            } else {
                // GAGNÉ : Gagné toute les manches
                stopTimer();
                calculateFinalScoreWithBonus();
                if(modeSelected.value === 'competitif') {
                    const playerPseudo = prompt("Félicitations! Vous avez gagné. Entrez votre pseudo:");
                    if (playerPseudo) {
                        addScore(playerPseudo, score);
                        displayGameInfo();
                        displayLeaderBoard();
                    }
                }
                modalHeader.textContent = 'Bravo !';
                btnWithBigThingsToDo.innerHTML = 'Nouvelle Partie';
                modalMessage.innerHTML = `<p style="font-style:italic;">Bravo ! Vous avez trouvé le mot !</p>`;
                myModal.show();
                initialBoardSettings();
            }
        } else {
            // PERDU : Gestion des essais et du Game Over
            if(currentAttemp < totalPossibleAttemps) {
                currentAttemp++;
                wordRowLayout(randWord.length, currentAttemp);
                displayGameInfo();
                numberOfKeyPushed = 0;

            } else {
                modalHeader.textContent = 'Game Over';
                btnWithBigThingsToDo.innerHTML = 'Nouvelle Partie';
                modalMessage.innerHTML = `<p style="font-style:italic;">Désolé, vous avez épuisé tous vos essais. Le mot à trouver était : <span style="font-weight: bold; font-style: italic;">${randWord}</span> vous pouvez réessayer en fermant la fenêtre et en cliquant sur le bouton "Nouvelle Partie"</p>`;
                myModal.show();
                initialBoardSettings();
            }
        }
    }
};

const compareWords = (word1, word2) => {
    const word = document.querySelector(`.current-attempt-${currentAttemp}`);
    const wordChilrend = word.children;
    const usedLetters = new Set();
    const randWord = word2.toUpperCase();

    let correctCount = 0;
    let wrongCount = 0;

    for (let i = 0; i < word1.length; i++) {
        const playerLetter = word1[i];
        const randLetter = word2[i].toUpperCase();
        const key = document.querySelector(`#key-${playerLetter}`);

        if(playerLetter === randLetter) {
            wordChilrend[i].classList.add('correct');
            usedLetters.add(playerLetter);
            correctLetters = {...correctLetters, [i]: playerLetter}
            key.classList.add('btn-danger');
            correctCount++;
        } else if (randWord.includes(playerLetter)) {
            wordChilrend[i].classList.add('wrong-place');
            usedLetters.add(playerLetter);
            key.classList.add('btn-warning');
            wrongCount++;
        } else {
            if (key) key.disabled = true;
        }
    }
    correctLettersPerAttempt.push(correctCount);
    wrongLettersPerAttempt.push(wrongCount);
};

const calculateScore = () => {
    if (currentAttemp > totalPossibleAttemps) {
        return 0;
    }

    let score = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    correctLettersPerAttempt.forEach(correct => {
        totalCorrect += correct;
    });

    wrongLettersPerAttempt.forEach(wrong => {
        totalWrong += wrong;
    });

    if (currentAttemp === 1) {
        score = (totalCorrect * 5) + 10;
    } else {
        score = (totalCorrect * 5) + (totalWrong * 1);
        let remainingAttempts = totalPossibleAttemps - currentAttemp;
        score -= (score / totalPossibleAttemps) * remainingAttempts;
    }

    return score;
};

const displayLeaderBoard = () => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    const scoreBoard = document.querySelector('#scoreBoard');
    scoreBoard.innerHTML = '';

    leaderboard.forEach(entry => {
        const scoreEntry = document.createElement('li');
        scoreEntry.classList.add('list-group-item');
        scoreEntry.classList.add('list-group-flush');
        scoreEntry.innerHTML = `<span style="font-weight:bold;" class="text">${entry.playerPseudo}:</span> <span class="score">${entry.bestScore}</span>`;
        scoreBoard.appendChild(scoreEntry);
    });
};

const displayGameInfo = () => {
    const gameInfo = document.querySelector('#gameInfo');
    gameInfo.innerHTML = '';

    const roundInfo = document.createElement('li');
    roundInfo.classList.add('list-group-item');
    roundInfo.classList.add('list-group-flush');
    roundInfo.innerHTML = `<span style="font-weight:bold;" class="text">Manche :</span> <span class="info">${currentRound}/${totalRounds}</span>`;
    gameInfo.appendChild(roundInfo);

    const attempts = document.createElement('li');
    attempts.classList.add('list-group-item');
    attempts.classList.add('list-group-flush');
    attempts.innerHTML = `<span style="font-weight:bold;" class="text">Essais :</span> <span class="info">${currentAttemp}/${totalPossibleAttemps}</span>`;
    gameInfo.appendChild(attempts);

    const difficulty = document.createElement('li');
    difficulty.classList.add('list-group-item');
    difficulty.classList.add('list-group-flush');
    difficulty.innerHTML = `<span style="font-weight:bold;" class="text">Difficulté :</span> <span class="info">${gameRules.difficulty[diffSelected.value].name}</span>`;
    gameInfo.appendChild(difficulty);

    const mode = document.createElement('li');
    mode.classList.add('list-group-item');
    mode.classList.add('list-group-flush');
    mode.innerHTML = `<span style="font-weight:bold;" class="text">Mode :</span> <span class="info">${gameRules.modes[modeSelected.value].name}</span>`;
    gameInfo.appendChild(mode);
}


const addScore = (playerPseudo, score) => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    leaderboard.push({ playerPseudo, bestScore: score });
    leaderboard.sort((a, b) => b.bestScore - a.bestScore);
    const newLeaderboard = leaderboard.slice(0, 5);

    localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard));
};

diffSelected.addEventListener('change', updateBoardSettings);
modeSelected.addEventListener('change', updateBoardSettings);
wordLengthSelected.addEventListener('change', updateBoardSettings);
btnWithBigThingsToDo.addEventListener('click', () => {
    modalHeader.textContent = "Paramètres de la partie";
    btnWithBigThingsToDo.innerHTML = 'Commencer';
    modalMessage.textContent = '';
});
document.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        myModal.hide();
    }
    pushKey(e);
})
document.addEventListener('keyup', checkWord);



// Initialisation
const initialBoardSettings = () => {
    updateBoardSettings();
    displayLeaderBoard();
    displayGameInfo();
};

// Exécution des fonctions
initialBoardSettings();