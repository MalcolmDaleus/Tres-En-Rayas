"use strict";

// ****** DECLARACIONES ******

// Inicialización de elementos DOM como variables para facilitar su uso
const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");
const gameStatus = document.getElementById("game-status");

// Variables de estado global del juego
let draw = false;
let hasWon = false;

// Efectos de sonido
const popSound = new Audio("sounds/pop.mp3");
const clickXSound = new Audio("sounds/clickX.mp3");
const clickOSound = new Audio("sounds/clickO.mp3");
const winSound = new Audio("sounds/win.mp3");
const drawSound = new Audio("sounds/draw.mp3");
const startSound = new Audio("sounds/start.mp3");

// Almacenamiento de identificadores HTML de las cajas del juego
const boxHTMLIds = [];

// Objetos del juego
const player1 = {
	isPlaying: false,
	winGame: false,
	boxSign: "X",
	boxesOccupied: [],
};
const player2 = {
	isPlaying: false,
	winGame: false,
	boxSign: "O",
	boxesOccupied: [],
};
const gameBoard = {
	elementid: document.getElementById("game-board"),
	boxes: new Map([
		["box0", [0, 0]],
		["box1", [0, 1]],
		["box2", [0, 2]],
		["box3", [1, 0]],
		["box4", [1, 1]],
		["box5", [1, 2]],
		["box6", [2, 0]],
		["box7", [2, 1]],
		["box8", [2, 2]],
	]),
};

// ****** FUNCIONES AUXILIARES ******

// Función que devuelve un booleano para comprobar si dos arrays son iguales.
// (Ignora la longitud)
function arrayEquals(arr1, arr2) {
	return arr1.every((value, index) => value === arr2[index]);
}

// Función de retardo usando una promesa
function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

// Ejecuta varias pruebas para cada posible forma de ganar el juego.
function checkWinner(playerBoxes) {
	checkRow(playerBoxes);
	checkColumn(playerBoxes);
	checkDiagnonalLeft(playerBoxes);
	checkDiagnonalRight(playerBoxes);
	checkDraw();
}

// ****** FUNCIONALIDAD DEL JUEGO ******

// Función que inicializa el juego creando las cajas utilizadas para las X y O y establece el turno del jugador.
// Llamado por el botón "start-button" en el HTML.
function start() {
	// Promesa para permitir ciertas animaciones previas al juego.
	delay(150).then(() => {
		startButton.style.display = "none";
		startSound.play();

		// Creación de las cajas con una implementación escalonada usando setInterval(). Se altera la propiedad CSS "transform" para crear una animación y se coloca el id HTML de cada caja en un array para su uso posterior.
		let i = 0;
		const setBoxes = setInterval(() => {
			let gameBox = document.createElement("div");
			gameBox.className = "game-box";
			setTimeout(() => {
				gameBox.style.transform = "scale(1.0)";
			}, 1);
			gameBox.id = "box" + i;
			boxHTMLIds.push(gameBox.id);
			gameBoard.elementid.appendChild(gameBox);
			gameBoard.elementid.insertBefore(gameBox, resetButton);
			popSound.play();
			i++;

			// Termina la implementación una vez colocadas las 9 cajas.
			if (i > 8) {
				clearInterval(setBoxes);
				setTimeout(() => {
					resetButton.style.display = "block";
					popSound.play();
				}, 400);
			}
		}, 600);

		// Establece los jugadores y crea los event listeners para el juego después de colocar las cajas.
		player1.isPlaying = true;
		player2.isPlaying = false;
		setTimeout(() => {
			for (let i = 0; i < 9; i++) {
				document
					.getElementById(boxHTMLIds[i])
					.addEventListener("click", useBox);
			}
		}, 3800);
	});
}

// Restaura el estado del juego, el estado de los jugadores, los botones y elimina las cajas. Luego llama a start().
function resetGame() {
	delay(150).then(() => {
		player1.boxesOccupied = [];
		player2.boxesOccupied = [];
		for (let i = 0; i < 9; i++) {
			document.getElementById(boxHTMLIds[i]).remove();
		}
		setTimeout(start, 300);
		startButton.style.display = "none";
		gameStatus.style.display = "none";
		resetButton.style.display = "none";
		resetButton.innerHTML = "Reiniciar";
		resetButton.style.fontSize = "3.25vw";
		draw = false;
		hasWon = false;
	});
}

// Maneja la lógica del evento click para cada caja. Comprueba qué jugador está jugando y si la caja seleccionada es una elección válida (no ocupada por una X o una O), luego cambia el HTML y CSS para colocar el símbolo y coincidir con el esquema de color. Luego llama a checkWinner() con el array de cajas ocupadas del objeto jugador.

function useBox(e) {
	let thisBox = gameBoard.boxes.get(e.target.id);
	// Jugador 1
	if (player1.isPlaying && !player2.boxesOccupied.includes(thisBox)) {
		e.target.style.color = "#ce0e0e";
		e.target.style.backgroundColor = "#fe9c9c";
		player1.boxesOccupied.push(thisBox);

		// Colocación retrasada del símbolo para corregir un error en la propiedad de transición
		setTimeout(() => {
			e.target.innerHTML = player1.boxSign;
			checkWinner(player1.boxesOccupied);
			clickXSound.play();
		}, 100);
		player2.isPlaying = true;
		player1.isPlaying = false;

		// Jugador 2
	} else if (player2.isPlaying && !player1.boxesOccupied.includes(thisBox)) {
		e.target.style.color = "#140ece";
		e.target.style.backgroundColor = "#9996ff";
		player2.boxesOccupied.push(thisBox);
		setTimeout(() => {
			e.target.innerHTML = player2.boxSign;
			checkWinner(player2.boxesOccupied);
			clickOSound.play();
		}, 100);
		player2.isPlaying = false;
		player1.isPlaying = true;
	}
}

// ****** PRUEBAS DE VICTORIA - FILAS ******
// Cada función toma como argumento el array de cajas ocupadas del objeto jugador.

// Comprueba cada fila usando el primer elemento en el array anidado de ubicaciones de cajas, que se refiere a la fila de la caja
function checkRow(playerBoxes) {
	let row0 = 0;
	let row1 = 0;
	let row2 = 0;
	for (let i = 0; i < playerBoxes.length; i++) {
		if (playerBoxes[i][0] == 0) {
			row0++;
		} else if (playerBoxes[i][0] == 1) {
			row1++;
		} else if (playerBoxes[i][0] == 2) {
			row2++;
		}
	}
	// Si el array incluye 3 cajas que provienen de la misma fila, es un caso de victoria válido y se muestran los resultados
	if (row0 == 3 || row1 == 3 || row2 == 3) {
		hasWon = true;
		displayResults();
	}
}

// Comprueba cada columna usando el segundo elemento en el array anidado de ubicaciones de cajas, que se refiere a la columna de la caja
function checkColumn(playerBoxes) {
	let column0 = 0;
	let column1 = 0;
	let column2 = 0;
	for (let i = 0; i < playerBoxes.length; i++) {
		if (playerBoxes[i][1] == 0) {
			column0++;
		} else if (playerBoxes[i][1] == 1) {
			column1++;
		} else if (playerBoxes[i][1] == 2) {
			column2++;
		}
	}
	// Si el array incluye 3 cajas que provienen de la misma columna, es un caso de victoria válido y se muestran los resultados
	if (column0 == 3 || column1 == 3 || column2 == 3) {
		hasWon = true;
		displayResults();
	}
}

// ****** PRUEBAS DE VICTORIA - DIAGONALES ******
// Cada diagonal está separada en izquierda o derecha y se comprueba contra los valores codificados correspondientes a las diagonales.
// Ambas hacen uso de la función auxiliar arrayEquals()

// Comprueba la diagonal que comienza desde la esquina superior izquierda
function checkDiagnonalLeft(playerBoxes) {
	let sum = 0;
	for (let i = 0; i < playerBoxes.length; i++) {
		if (arrayEquals(playerBoxes[i], [0, 0])) {
			sum++;
		} else if (arrayEquals(playerBoxes[i], [1, 1])) {
			sum++;
		} else if (arrayEquals(playerBoxes[i], [2, 2])) {
			sum++;
		}
	}
	// Si el array incluye 3 cajas que corresponden a la diagonal izquierda del tablero, es un caso de victoria válido y se muestran los resultados
	if (sum == 3) {
		hasWon = true;
		displayResults();
	}
}

// Comprueba la diagonal que comienza desde la esquina superior derecha
function checkDiagnonalRight(playerBoxes) {
	let sum = 0;
	for (let i = 0; i < playerBoxes.length; i++) {
		if (arrayEquals(playerBoxes[i], [0, 2])) {
			sum++;
		} else if (arrayEquals(playerBoxes[i], [1, 1])) {
			sum++;
		} else if (arrayEquals(playerBoxes[i], [2, 0])) {
			sum++;
		}
	}
	// Si el array incluye 3 cajas que corresponden a la diagonal derecha del tablero, es un caso de victoria válido y se muestran los resultados
	if (sum == 3) {
		hasWon = true;
		displayResults();
	}
}

// ****** PRUEBAS DE EMPATE ******

// Si no se encuentra un caso de victoria y las 9 cajas están ocupadas, el juego termina en empate. Esto comprueba que las 9 cajas estén ocupadas por X u O y marca un empate si el juego no está ya ganado.
function checkDraw() {
	let full = 0;
	for (let i = 0; i < 9; i++) {
		if (!document.getElementById(boxHTMLIds[i]).innerHTML == "") {
			full++;
		}
	}
	if (full == 9 && hasWon == false) {
		draw = true;
		displayResults();
	}
}

// ****** MOSTRANDO RESULTADOS ******

// Muestra los resultados del juego según el estado del juego. Oculta los botones y comprueba qué jugador hizo el último movimiento para ganar (usa !player1.isPlaying debido a un error donde el estado del jugador cambia antes de que se muestren los resultados)
function displayResults() {
	gameStatus.style.display = "block";
	for (let i = 0; i < 9; i++) {
		document
			.getElementById(boxHTMLIds[i])
			.removeEventListener("click", useBox);
	}
	if (!draw && hasWon == true) {
		gameStatus.innerHTML = !player1.isPlaying
			? "¡Jugador 1 Gana!"
			: "¡Jugador 2 Gana!";
		winSound.play();
	} else {
		gameStatus.innerHTML = "¡Empate!";
		drawSound.play();
	}
	resetButton.innerHTML = "¿Jugar de nuevo?";
	resetButton.style.fontSize = "1.875vw";
}
