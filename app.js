const categories = [];
const chosenCategory = [];
let result = 0;
let timeId = 0;
let atQuestion = 0;
let captureCategory;
let correctAtFirstAttempt
let display;
let api;
let totalQuestions;

const preloader = document.querySelector('.preloader');
const secondPage = document.querySelector('.second-page');
const date = document.querySelector('.date');
const insertCategory = document.querySelector('.insert-category');
const firstNav = document.querySelector('.nav');
const score = document.querySelector('.score');
const time = document.querySelector('.time');
const main = document.querySelector('.main');
const questionAnswer = document.querySelector('.question-answer');
const finalPage = document.querySelector('.final-page');
const restart = document.querySelector('.restart');
const home = document.querySelector('.home');


//add date
const setDate = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
/*The toLocaleString method is used to convert the Date object into a string representation based on the specified options.*/
const formattedDate = setDate.toLocaleString(undefined, options);

date.innerHTML = formattedDate;

//remove preloader after 1s
window.addEventListener('load', function () {
    setTimeout(function () {
        preloader.style.animation = 'fadeOut 0.5s ease-in-out';
        preloader.classList.add('hide-preloader');
        secondPage.classList.remove('second-page');
        secondPage.classList.add('unhide-second-page');
    }, 1000);
});

//add categories dynamically through api
async function test() {
    try {
        api = await axios.get('https://opentdb.com/api.php?amount=50&type=multiple');
        //getting unique categories
        categories.push(
            ...api.data.results.reduce((acc, result) => {
                const category = result.category;
                if (!acc.includes(category)) {
                    acc.push(category);
                }
                return acc;
            }, [])
        );

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

test()
    .then(() => {
        createButtons();
    })
    .then(() => {
        //event delegation
        insertCategory.addEventListener('click', function (e) {
            const targetBtn = e.target;

            if (targetBtn.classList.contains('btn')) {
                playSound('game-start.mp3');
                makeChoice(targetBtn);

                secondPage.remove();
                firstNav.remove();
                main.classList.add('add-main');

                increaseTime();
                displayQuestions();

            }
        });
    })

//display questions based on category selected
function displayQuestions() {
    display = chosenCategory.map((item, index) => {
        const options = [...item.incorrect_answers, item.correct_answer];
        options.sort(() => 0.5 - Math.random());

        // Mapping the shuffled answers to the HTML structure
        const answerOptions = options.map((newItem, newInd) => {
            const correctNess = (newItem === item.correct_answer) ? 'correct-answer' : 'incorrect_answer';

            //String.fromCharCode() to convert into string. 97 is 'a' in ascii
            return `<li class="answer-option ${correctNess} question-${index + 1}">
                        <i class="fa-solid fa-${String.fromCharCode(97 + newInd)}"></i>
                        ${newItem}
                    </li>`;
        }).join('');

        return `<div class="question-${index + 1} qtn">
                    <ul class="question-wrapper">
                        <li>${item.question}</li>
                    </ul>
                    <ul class="answer-wrapper">
                        ${answerOptions}
                    </ul>
                </div>`;
    });

    displayNextQuestion(display, atQuestion, chooseAnswer);
}

function displayNextQuestion(display, atQuestion, chooseAnswer) {

    if (atQuestion < chosenCategory.length) {
        questionAnswer.innerHTML = display[atQuestion];
        chooseAnswer();
    }
    if (atQuestion >= chosenCategory.length) {
        questionAnswer.remove();
        score.remove();
        clearInterval(timeId);
        playSound('success_bell.mp3');
        finalPage.classList.add('add-final-page');
        const showResult = document.querySelector('.show-result');
        showResult.append(result);
    }
}

function chooseAnswer() {
    const answerWrapper = document.querySelectorAll('.answer-wrapper');

    answerWrapper.forEach(wrapper => {
        correctAtFirstAttempt = true; //for each question check if solved at first attempt
        wrapper.addEventListener('click', function (e) {
            if (e.target.classList.contains('answer-option')) {
                handleClickEvent(e.target);
            }
        });
    });
}

function handleClickEvent(e) {
    const isCorrect = e.classList.contains('correct-answer');
    if (isCorrect) {
        e.style.backgroundColor = 'green';
        playSound('right-answer.mp3');
        if (correctAtFirstAttempt) result++;
        displayingEndAndNext();
    } else {
        e.style.backgroundColor = 'red';
        playSound('wrong-answer.mp3');
        correctAtFirstAttempt = false;
    }
}

function displayingEndAndNext() {
    if (atQuestion < chosenCategory.length) {
        atQuestion++;
    }
    setTimeout(() => {
        displayNextQuestion(display, atQuestion, chooseAnswer);
    }, 1000);
}

//restart quiz
restart.addEventListener('click', function () {
    window.location.reload();
});
home.addEventListener('click', function () {
    window.location.reload();
});

//button creation after categrories were fetched 
function createButtons() {

    const addCategory = categories.map(item => {
        return `<button class="${item} btn">${item}</button>`
    }).join('');
    insertCategory.innerHTML = addCategory;
}

function playSound(sound) {
    const audio = new Audio(`sounds/${sound}`);
    audio.play();
}

//timer for time spent on attempting questions
function increaseTime() {
    let seconds = 0;
    let minutes = 0;
    timeId = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }

        let timeFormat = ` ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        time.textContent = timeFormat;
        score.textContent = `${result}/${totalQuestions}`
    }, 1000);
}

//player selected category. pushes object
function makeChoice(btn) {
    captureCategory = btn.classList.value;
    captureCategory = captureCategory.slice(0, captureCategory.length - 4);

    chosenCategory.push(
        ...api.data.results.reduce((acc, item) => {
            //some categories contain classlist with &amp; but in value we get &. so to get questions of that category we r doing this
            if (item.category.includes('&')) {
                const modifiedCategory = captureCategory.replace('&', '&amp;')
                if (item.category === captureCategory || item.category === modifiedCategory) {
                    acc.push(item);
                }
            } else {
                if (item.category === captureCategory) {
                    acc.push(item);
                }
            }           
            return acc;
        }, [])
    );

    totalQuestions = chosenCategory.length;
}


