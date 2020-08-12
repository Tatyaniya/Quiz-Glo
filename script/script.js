document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const btnOpenModal = document.querySelector('#btnOpenModal');
    const modalBlock = document.querySelector('#modalBlock');
    const closeModal = document.querySelector('#closeModal');
    const modalTitle = document.querySelector('.modal-title');
    const questionTitle = document.querySelector('#question');
    const formAnswers = document.querySelector('#formAnswers');
    const burgerBtn = document.getElementById('burger');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const modalDialog = document.querySelector('.modal-dialog');
    const sendButton = document.getElementById('send');

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBF4-CwNAkJqfH9yqraORS8B70SmqLfww8",
        authDomain: "quiz2-c482b.firebaseapp.com",
        databaseURL: "https://quiz2-c482b.firebaseio.com",
        projectId: "quiz2-c482b",
        storageBucket: "quiz2-c482b.appspot.com",
        messagingSenderId: "658998091050",
        appId: "1:658998091050:web:c164c2ea2606f14e611253",
        measurementId: "G-1CGCGQW2LX"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    /* Функция получения данных */
    const getData = () => {
        /* LOAD можно заменить на спиннер */
        formAnswers.textContent = 'LOAD';
        
        nextButton.classList.add('d-none');
        prevButton.classList.add('d-none');

        setTimeout(() => {
            firebase.database().ref().child('questions').once('value').then(snap => playTest(snap.val()))
        }, 500);        
    };

    /* Ширина окна */
    let clientWidth = document.documentElement.clientWidth;

    /* Показать/скрыть бургер */
    if(clientWidth < 768) {
        burgerBtn.style.display = 'flex';
    } else {
        burgerBtn.style.display = 'none';
    }

    /* Переназначаем переменную при изменении ширины окна */
    window.addEventListener('resize', () => {
        clientWidth = document.documentElement.clientWidth;

        if(clientWidth < 768) {
            burgerBtn.style.display = 'flex';
        } else {
            burgerBtn.style.display = 'none';
        }
    });

    /* Анимация модального окна */
    let count = -100;

    modalDialog.style.top = count + "%";

    const animateModal = () => {
        modalDialog.style.top = count + "%";
        count += 3.5;

        if(count < 0) {
            requestAnimationFrame(animateModal);
        } else {
            count = -100;
        }
    };

    /* Начать тест */
    const playTest = (questions) => {
        /* Номер вопроса */
        let numberQuestion = 0;
        /* Ответы пользователя */
        const finalAnswers = [];
        /* Данные из инпутов */
        const obj = {};

        modalTitle.textContent = 'Ответь на вопрос:';

        /* Рендерим ответ */
        const renderAnswers = index => {
            
            questions[index].answers.forEach((answer) => {
                const answerItem = document.createElement('div');

                answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');

                answerItem.innerHTML = `
                    <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value="${answer.title}">
                    <label for="${answer.title}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${answer.url}" alt="burger">
                        <span>${answer.title}</span>
                    </label>
                `;

                formAnswers.appendChild(answerItem);
            });
        };

        /* Рендерим вопрос */
        const renderQuestions = indexQuestion => {
            formAnswers.innerHTML = '';

            if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
                questionTitle.textContent = `${questions[indexQuestion].question}`;
                renderAnswers(indexQuestion);
                nextButton.classList.remove('d-none');
                prevButton.classList.remove('d-none');
                sendButton.classList.add('d-none');

                /* Можно открывать кнопки, если выбран элемент */
                nextButton.disabled = false;
            }

            /* Скрываем кнопку prev на первом вопросе */
            if(numberQuestion === 0) {
                prevButton.classList.add('d-none');
            }
            
            /* Показываем кнопку send после последнего вопроса */
            if(numberQuestion === questions.length) {
                nextButton.classList.add('d-none');
                prevButton.classList.add('d-none');
                sendButton.classList.remove('d-none');
                modalTitle.textContent = '';
                questionTitle.textContent = '';
                formAnswers.innerHTML = `
                    <div class="form-group">
                        <label for="numberPhone">Введите телефон:</label>
                        <input type="phone" id="numberPhone" class="form-control">
                    </div>
                `;

                /* Валидация инпута для номера телефона */
                const numberPhone = document.getElementById('numberPhone');
                numberPhone.addEventListener('input', event => {
                    event.target.value = event.target.value.replace(/[^0-9+-]]/, '');
                });
            }

            /* Сообщение после отправки и закрытие окна */
            if(numberQuestion === questions.length + 1) {
                formAnswers.textContent = 'Спасибо! Наш менеджер свяжется с Вами.';
                sendButton.classList.add('d-none');

                /* Пушим данные в конце, чтобы перезаписывать, если были изменения */
                for(let key in obj) {
                    let newObj = {};
                    newObj[key] = obj[key];
                    finalAnswers.push(newObj);
                }

                setTimeout(() => {
                    modalBlock.classList.remove('d-block');
                    burgerBtn.classList.remove('active');
                }, 2000);
            }
        };

        renderQuestions(numberQuestion);

        /* Собираем данные из модального окна */
        const checkAnswer = () => {
            
            const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === 'numberPhone');

            inputs.forEach((input, index) => {
                if(numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
                    obj[`${index}_${questions[numberQuestion].question}`] = input.value;
                }

                if(numberQuestion === questions.length) {
                    obj['Номер телефона'] = input.value;
                }
                
            });
        }

        prevButton.onclick = () => {
            numberQuestion--;
            renderQuestions(numberQuestion);
        };

        nextButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
        };

        sendButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
            firebase.database().ref().child('contacts').push(finalAnswers);
        }
    };

    /* Показать модальное окно по клику на бургер */
    burgerBtn.addEventListener('click', () => {
        requestAnimationFrame(animateModal);
        burgerBtn.classList.add('active');
        modalBlock.classList.add('d-block');
        getData();
    });

    /* Показать модальное окно по клику на кнопку */
    btnOpenModal.addEventListener('click', () => {
        requestAnimationFrame(animateModal);
        modalBlock.classList.add('d-block');
        getData();
    });

    /* Закрыть модальное окно по крестику */
    closeModal.addEventListener('click', () => {
        modalBlock.classList.remove('d-block');
        burgerBtn.classList.remove('active');
    });

    /* Закрытие модального окна при клике за его прeделы */
    document.addEventListener('click', event => {
        if(!event.target.closest('.modal-dialog') && 
        !event.target.closest('.btn-outline-danger') && 
        !event.target.closest('.burger')) {
            modalBlock.classList.remove('d-block');
            burgerBtn.classList.remove('active');
        }
    });
});
