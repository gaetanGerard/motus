import data from './words.json' with { type: 'json' };
import gameRules from './gameRules.json' with { type: 'json' };

// retrieve html elements
const diffSelected = document.querySelector('#difficulty-choice');
const diffMessageP = document.querySelector('.difficulty-message');
const modeSelected = document.querySelector('#game-mode-choice');
const modeMessageP = document.querySelector('.game-mode-message');
const wordLengthSelected = document.querySelector('#word-length-choice');
const wordLengthMessageP = document.querySelector('.word-length-message');
const board = document.querySelector('.board');
const keyboardKey = document.querySelectorAll('.keyboard-key');
let numberOfKeyPushed = 0;
let playerWord = '';
let currentWordLength = 0;
let totalPossibleAttemps = 0;
let currentGameMode = '';
let currentAttemp = 1;
let currentRound = 1;
let totalRounds = 0;

// Mise en place du layout du jeu
const wordRowLayout = (wordLength, currentAttemp) => {
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
        span.innerHTML  = '.';
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
    board.textContent = '';

};

// Sélectionner un mot aléatoire
const randomWord = (wordLength) => {
    const words = data[wordLength].filter(word => word.length === parseInt(wordLength));
    return words[Math.floor(Math.random() * words.length)];
};

let randWord = ''

// Update Settings message function
const updateBoardSettings = () => {
    const selectedDifficulty = gameRules.difficulty[diffSelected.value];
    const selectedMode = gameRules.modes[modeSelected.value];
    const diffMessage = `En mode ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const modeMessage = `${selectedMode.description} En difficulté ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const wordLengthMessage = `Vous devez trouver un mot de ${wordLengthSelected.value} lettres.`;
    randWord = randomWord(wordLengthSelected.value);

    resetLayout();

    diffMessageP.textContent = diffMessage;
    modeMessageP.textContent = modeMessage;
    wordLengthMessageP.textContent = wordLengthMessage;

    const newWordLength = parseInt(wordLengthSelected.value);
    const newTotalPossibleAttemps = selectedDifficulty.attempts;
    const newRound = selectedMode.rounds;

    if (newWordLength !== currentWordLength) {
        currentWordLength = newWordLength;
        randWord = randomWord(newWordLength);
    }

    if (newTotalPossibleAttemps !== totalPossibleAttemps) {
        totalPossibleAttemps = newTotalPossibleAttemps;
    }

    if (newRound !== totalRounds) {
        totalRounds = newRound;
    }

    wordRowLayout(newWordLength, currentAttemp);

};

// Récupérer le bouton pousser pour la lettre
const pushKey = (e) => {
    const word = document.querySelector(`.current-attempt-${currentAttemp}`);
    if(numberOfKeyPushed < randWord.length) {
        word.children[numberOfKeyPushed].children[0].textContent = e.target.value.toUpperCase();
        playerWord += word.children[numberOfKeyPushed].children[0].textContent;
        return numberOfKeyPushed++;
    }
};

// Vérifier le mot
const checkWord = (e) => {
    if(numberOfKeyPushed === randWord.length) {
        if(playerWord === randWord) {
            console.log('Bravo ! Vous avez trouvé le mot !');
        } else {
            if(currentAttemp < totalPossibleAttemps) {
                compareWords(playerWord, randWord);
                currentAttemp++;
                wordRowLayout(wordLengthSelected.value, currentAttemp);
                numberOfKeyPushed = 0;
            } else {
                alert('Game Over, le mot était : ' + randWord);
            }
        }
    }
};

const compareWords = (word1, word2) => {
    const word = document.querySelector(`.current-attempt-${currentAttemp}`);
    const wordChilrend = word.children;
    const usedLetters = new Set();
    const randWord = word2.toUpperCase();

    console.log('Player Word :', word1);
    console.log('Random Word :', word2.toUpperCase());

    for (let i = 0; i < word1.length; i++) {
        const playerLetter = word1[i];
        const randLetter = word2[i].toUpperCase();

        console.log('Player Letter :', playerLetter);
        console.log('Random Letter :', randLetter);

        if(playerLetter === randLetter) {
            wordChilrend[i].classList.add('correct');
            usedLetters.add(playerLetter);

            /*
            *
            * A cet étape il faut récupérer les lettre correctement placer et les afficher dans l'html du deuxième essai
            *
            *
            */
        } else if (randWord.includes(playerLetter)) {
            console.log("passing")
            wordChilrend[i].classList.add('wrong-place');
            usedLetters.add(playerLetter);
        } else {
            const key = document.querySelector(`#key-${playerLetter}`);
            if (key) key.disabled = true;
        }
    }
};


// Initialisation
const initialBoardSettings = () => updateBoardSettings();

diffSelected.addEventListener('change', updateBoardSettings);
modeSelected.addEventListener('change', updateBoardSettings);
wordLengthSelected.addEventListener('change', updateBoardSettings);
keyboardKey.forEach(key => key.addEventListener('click', pushKey));
document.addEventListener('click', checkWord);

// Exécution des fonctions
initialBoardSettings();

console.log('randWord :', randWord)
