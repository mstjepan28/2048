let gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]
let score = 0;

const objectSize = 150;
const objectSpacing = 10;

let disableMovement = false;
let elementsMoved = false;
let previousGameStates = [];

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/* ********************************************************************************************* */
/* ** DEBUG ************************************************************************************ */
/* ********************************************************************************************* */
    let elementNum = 0; 
    let timeInBetween = 125;

    const fillBoard = () => { // DEBUG
        for(let row = 0; row < 4; row++){
            for(let col = 0; col < 4; col++){
                if(row == 3 && col == 3) return;
                //if(col % 2 == 0) continue;
                elementNum++;

                const newElement = document.createElement('div');
                newElement.classList.add("game_object");
                const pos = {x: row, y: col};
            
                gameBoard[pos.x][pos.y] = {
                    domElement: newElement,
                    xCord: pos.x,
                    yCord: pos.y,
                    value: elementNum,
                    moved: false,
                }
                
                const yOffset = (pos.y * objectSize) + (pos.y * objectSpacing + objectSpacing);
                const xOffset = (pos.x * objectSize) + (pos.x * objectSpacing + objectSpacing);
                
                newElement.style.top = `${yOffset}px`;
                newElement.style.left = `${xOffset}px`;
                newElement.innerText = gameBoard[pos.x][pos.y].value;
            
                document.getElementById("active_board").appendChild(newElement);
            }
        }
    }
    const showOrder = (gameObject) => {
        gameObject.domElement.style.backgroundColor = "red";
        setTimeout(() => gameObject.domElement.style.backgroundColor = "", 1500)
    }
/* ******************************************************************************************** */
/* ********************************************************************************************* */

const saveCurGameState = () => {
    previousGameStates.push(gameBoard)

    if(previousGameStates.length <= 10) return;

    const curLen = previousGameStates.length
    previousGameStates = previousGameStates.slice(curLen - 10)
}

const loadLastGameState = () => {
    const boardDomElement = document.getElementById("active_board");
    const lastState = previousGameStates[previousGameStates.length - 1];

    if(!lastState) return;

    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            const curState = gameBoard[row][col];
            const prevState = lastState[row][col];

            console.log(prevState.domElement)

            if(curState) curState.domElement.remove();
            if(prevState) boardDomElement.appendChild(prevState.domElement);

            gameBoard[row][col] = prevState;
        }
    }

    gameBoard = lastState
}

const resetGame = () => {
    document.getElementById("gameOver").classList.remove("activeGameOver");

    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            const gameObject = gameBoard[col][row];
            if(gameObject) gameObject.domElement.remove();
        }
    }

    gameBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    score = 0;
    disableMovement = false;
    previousGameStates = []

    getNewElement();
}

const checkForGameOver = () => {
    if(getRandomPosition()) return; // if there are any empty spots, game is not over

    let gameOver = false;

    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            const gameObject = gameBoard[col][row];

            gameOver = ![
                gameBoard[clamp(row - 1, 0, 3)][clamp(col - 1, 0, 3)],
                gameBoard[clamp(row + 1, 0, 3)][clamp(col - 1, 0, 3)],
                gameBoard[clamp(row - 1, 0, 3)][clamp(col + 1, 0, 3)],
                gameBoard[clamp(row + 1, 0, 3)][clamp(col + 1, 0, 3)] ,
            ].filter(neighbor => {
                return gameObject != neighbor && gameObject.value == neighbor.value 
            }).length;
            console.log(gameOver)

            if(gameOver) return triggerGameOver();
        }
    }
}

const triggerGameOver = () => {
    document.getElementById("gameOver").classList.add("activeGameOver");
    document.getElementById("gameOverScore").innerText = `FINAL SCORE: ${score}`;
    
    score = 0;
}

const getNewElement = () => {
    const newElement = document.createElement('div');
    newElement.classList.add("game_object");
    const pos = getRandomPosition();
    const randValue = randInt(1, 10) > 8? 4: 2;

    if(!pos) return triggerGameOver();

    gameBoard[pos.x][pos.y] = {
        domElement: newElement,
        xCord: pos.x,
        yCord: pos.y,
        value: randValue,
        moved: false,
    }

    const yOffset = (pos.y * objectSize) + (pos.y * objectSpacing + objectSpacing);
    const xOffset = (pos.x * objectSize) + (pos.x * objectSpacing + objectSpacing);
    
    newElement.style.top = `${yOffset}px`;
    newElement.style.left = `${xOffset}px`;
    newElement.innerText = randValue;

    document.getElementById("active_board").appendChild(newElement);

    if(randValue == 4){
        newElement.style.backgroundColor = "#ece0ca";
        newElement.style.color = "#7e817d";
    }

    saveCurGameState();
}

const getRandomPosition = () => {
    let emptySpaces = {}

    gameBoard.forEach((row, rowIndex) => {
        emptySpaces[rowIndex] = row.flatMap((cellValue, index) => !cellValue? index : []);
    })
    
    Object.keys(emptySpaces).forEach(key => {
        if(emptySpaces[key].length == 0) delete emptySpaces[key]
    })

    // get a random index for an empty col
    const emptyCols = Object.keys(emptySpaces)
    if(!emptyCols.length) return null

    const x = emptyCols[randInt(0, emptyCols.length - 1)]
    
    const emptyRow = randInt(0, emptySpaces[x].length - 1)
    const y = emptySpaces[x][emptyRow]

    return {
        x: parseInt(x),
        y: parseInt(y),
    }
}

const updateScore = (scoreAddition) => {
    score += scoreAddition;

    document.getElementById("score").innerText = `SCORE: ${score}`
}

const mergeGameObjects = (gameObject, nextPosition) => {
    nextPosition.value *= 2;
    nextPosition.domElement.innerText = nextPosition.value;

    const colors = {
        512: "#efc231",
        256: "#edce64",
        128: "#edce71",
        64: "#f65d3b",
        32: "#f57c5f",
        16: "#f59565",
        8: "#f59563",
        4: "#ece0ca",
        2: "#eee4da"
    }
    nextPosition.domElement.style.backgroundColor = colors[nextPosition.value % 512];
    nextPosition.domElement.style.color = nextPosition.value > 4? "white": "#7e817d";

    nextPosition.domElement.classList.add("expand");
    setTimeout( ()=> nextPosition.domElement.classList.remove("expand"), 500)

    gameObject.domElement.remove();
    gameBoard[gameObject.xCord][gameObject.yCord] = 0;

    updateScore(nextPosition.value);
}

const moveGameObjects = (gameObject, moveBy) => {
    const newXCord = clamp(gameObject.xCord + moveBy.x, 0, 3);
    const newYCord = clamp(gameObject.yCord + moveBy.y, 0, 3);

    const nextPosition = gameBoard[newXCord][newYCord];
    
    if(nextPosition){
        if(gameObject != nextPosition && gameObject.value == nextPosition.value){
            elementsMoved = true;
            mergeGameObjects(gameObject, nextPosition);
        }
        else{
            gameObject.moved = true;
        }
        return;
    }

    const yOffset = (newYCord * objectSize) + (newYCord * objectSpacing + objectSpacing);
    const xOffset = (newXCord * objectSize) + (newXCord * objectSpacing + objectSpacing);
    
    gameObject.domElement.style.top = `${yOffset}px`;
    gameObject.domElement.style.left = `${xOffset}px`;

    gameBoard[gameObject.xCord][gameObject.yCord] = 0;
    gameBoard[newXCord][newYCord] = gameObject;

    gameObject.xCord = newXCord;
    gameObject.yCord = newYCord;

    elementsMoved = true;
    moveGameObjects(gameObject, moveBy);
}

const moveUp = (movement) => {
    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            const gameObject = gameBoard[col][row];

            if(!gameObject || gameObject.moved) continue;
            moveGameObjects(gameObject, movement);
        }
    }
}
const moveDown = (movement) => {
    for(let row = 3; row >= 0; row--){
        for(let col = 3; col >= 0; col--){
            const gameObject = gameBoard[col][row];

            if(!gameObject || gameObject.moved) continue;
            moveGameObjects(gameObject, movement);
        }
    }
}
const moveLeft = (movement) => {
    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            const gameObject = gameBoard[row][col];

            if(!gameObject || gameObject.moved) continue;
            moveGameObjects(gameObject, movement);
        }
    }
}
const moveRight = (movement) => {
    for(let row = 3; row >= 0; row--){
        for(let col = 0; col < 4; col++){
            const gameObject = gameBoard[row][col];

            if(!gameObject || gameObject.moved) continue; 
            moveGameObjects(gameObject, movement);
        }
    }
}

const keyboardEventHandler = (event) => {
    if(disableMovement) return;
    disableMovement = true;

    elementsMoved = false;

    const moveHandler = {
        ArrowUp: () => moveUp({x: 0, y: -1}),
        ArrowDown: () => moveDown({x: 0, y: 1}),
        ArrowLeft: () => moveLeft({x: -1, y: 0}),
        ArrowRight: () => moveRight({x: 1, y: 0}),
    }
    moveHandler[event.key]?.();

    gameBoard.forEach(row => {
        row.forEach(gameObject => {
            gameObject.moved = false
        })
    })

    setTimeout(() => {
        if(elementsMoved) getNewElement();
        checkForGameOver();
        disableMovement = false
    }, 250)
}

//fillBoard();//DEBUG
getNewElement();

document.addEventListener('keydown', keyboardEventHandler);

const undoButton = document.getElementById("controls_undo")
undoButton.addEventListener('click', loadLastGameState);

const resetButton = document.getElementById("controls_reset")
resetButton.addEventListener('click', resetGame);

const gameOverReset = document.getElementById("gameOverReset")
gameOverReset.addEventListener('click', resetGame);