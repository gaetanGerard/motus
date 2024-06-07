import data from './words.json' with { type: 'json' };
import gameRules from './gameRules.json' with { type: 'json' };

// retrieve html elements
const myModal = new bootstrap.Modal(document.getElementById('mainModal'));
const modalHeader = document.querySelector('.modal-header');
const modalBody = document.querySelector('.modal-body');
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
let currentGameMode = '';
let currentAttemp = 1;
let currentRound = 1;
let totalRounds = 0;
let result = {};
let correctLetters = {};

// Sélectionner un mot aléatoire
const randomWord = (wordLength) => {
    const words = data[wordLength].filter(word => word.length === parseInt(wordLength));
    return words[Math.floor(Math.random() * words.length)];
};

let randWord = ''

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

    keyboardKey.forEach(key => {
        key.classList.remove('btn-danger');
        key.classList.remove('btn-warning');
        key.disabled = false;
    }
    );

};

// Update Settings message function
const updateBoardSettings = () => {
    resetLayout();
    const selectedDifficulty = gameRules.difficulty[diffSelected.value];
    const selectedMode = gameRules.modes[modeSelected.value];
    const diffMessage = `En mode ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const modeMessage = `${selectedMode.description} En difficulté ${selectedDifficulty.name} vous avez droit à ${selectedDifficulty.attempts} essais pour trouver le mot. Bonne chance !`;
    const wordLengthMessage = `Vous devez trouver un mot de ${wordLengthSelected.value} lettres.`;
    randWord = randomWord(wordLengthSelected.value);

    diffMessageP.textContent = diffMessage;
    modeMessageP.textContent = modeMessage;
    wordLengthMessageP.textContent = wordLengthMessage;

    const newWordLength = parseInt(wordLengthSelected.value);
    const newTotalPossibleAttemps = selectedDifficulty.attempts;
    const newRound = selectedMode.rounds;

    if (newWordLength !== currentWordLength) {
        currentWordLength = newWordLength;
        randWord = randomWord(currentWordLength);
    }

    if (newTotalPossibleAttemps !== totalPossibleAttemps) {
        totalPossibleAttemps = newTotalPossibleAttemps;
    }

    if (newRound !== totalRounds) {
        totalRounds = newRound;
    }

    wordRowLayout(newWordLength, currentAttemp);
    console.log('randWord :', randWord)

};

// Récupérer le bouton pousser pour la lettre
const pushKey = (e) => {
    const pressedKey = e.key.toUpperCase();
    const word = document.querySelector(`.current-attempt-${currentAttemp}`);
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
};

// Vérifier le mot
const checkWord = (e) => {
    if(numberOfKeyPushed === randWord.length) {
        if(playerWord === randWord.toUpperCase()) {
            // GAGNÉ : Gestion des victoires par manche
            console.log('Manche Total : ', totalRounds);
            console.log('Manche Actuelle : ', currentRound);
            console.log('Bravo ! Vous avez trouvé le mot !');
            if(currentRound < totalRounds) {
                modalHeader.textContent = 'Bravo !';
                btnWithBigThingsToDo.innerHTML = 'Manche Suivante';
                modalMessage.innerHTML = `<p style="font-style:italic;">Bravo ! Vous avez trouvé le mot !</p>`;
                myModal.show();
                currentRound++;
                // Je dois réinitialiser le tableau
                // reset les boutons
                // reset les lettres
                // reset les tentatives
                // conserver le mot précédemment trouver pour calculer le score total
                // conserver le currentRound pour savoir si on est à la dernière manche ou non
                // conserver le totalRounds pour savoir combien de manche il y a

            } else {
                modalHeader.textContent = 'Bravo !';
                btnWithBigThingsToDo.innerHTML = 'Nouvelle Partie';
                modalMessage.innerHTML = `<p style="font-style:italic;">Bravo ! Vous avez trouvé le mot !</p>`;
                myModal.show();
                initialBoardSettings();
            }
        } else {
            // PERDU : Gestion des essais et du Game Over
            if(currentAttemp < totalPossibleAttemps) {
                compareWords(playerWord, randWord);
                currentAttemp++;
                wordRowLayout(wordLengthSelected.value, currentAttemp);
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

    for (let i = 0; i < word1.length; i++) {
        const playerLetter = word1[i];
        const randLetter = word2[i].toUpperCase();
        const key = document.querySelector(`#key-${playerLetter}`);

        if(playerLetter === randLetter) {
            wordChilrend[i].classList.add('correct');
            usedLetters.add(playerLetter);
            correctLetters = {...correctLetters, [i]: playerLetter}
            key.classList.add('btn-danger');
        } else if (randWord.includes(playerLetter)) {
            wordChilrend[i].classList.add('wrong-place');
            usedLetters.add(playerLetter);
            key.classList.add('btn-warning');
        } else {
            if (key) key.disabled = true;
        }
    }
};


// Initialisation
const initialBoardSettings = () => updateBoardSettings();

diffSelected.addEventListener('change', updateBoardSettings);
modeSelected.addEventListener('change', updateBoardSettings);
wordLengthSelected.addEventListener('change', updateBoardSettings);
btnWithBigThingsToDo.addEventListener('click', () => {
    modalHeader.textContent = "Paramètres de la partie";
    btnWithBigThingsToDo.innerHTML = 'Commencer';
    modalMessage.textContent = '';
});
document.addEventListener('keydown', pushKey)
document.addEventListener('keyup', checkWord);

// Exécution des fonctions
initialBoardSettings();