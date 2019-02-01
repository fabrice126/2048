import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.nbSquareGrid = 4;
    const tGrid = [];
    // On initialise notre grille de jeu
    for (let i = 0; i < this.nbSquareGrid; i++) {
      tGrid.push(Array(this.nbSquareGrid).fill(0));
    }
    this.insertValue(tGrid);
    this.insertValue(tGrid);
    this.state = { tGrid };
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }
  /**
   * Permet d'ajouter une valeur à la grille de jeu
   * @param {array} tGrid tableau représentant la grille de jeu
   */
  insertValue(tGrid) {
    const value = this.generateValue();
    const tAvailableCells = this.getAvailableCells(tGrid);
    if (!tAvailableCells.length) return;
    const randIdx = Math.floor(Math.random() * tAvailableCells.length);
    const { i, j } = tAvailableCells[randIdx];
    tGrid[i][j] = value;
  }
  /**
   * Permet de générer une valeur 4 ou 2, la valeur 2 sera généré 80% du temps
   * @returns {number} retourne 4 ou 2
   */
  generateValue() {
    return Math.random() > 0.8 ? 4 : 2;
  }
  /**
   * Permet de récupérer les cellules vides
   * @param {array} tGrid tableau représentant la grille de jeu
   * @returns {array} tableau d'objet contenant la position i et j des cases disponibles
   */
  getAvailableCells(tGrid) {
    const tAvailableCells = [];
    for (let i = 0; i < this.nbSquareGrid; i++) {
      for (let j = 0; j < this.nbSquareGrid; j++) {
        if (tGrid[i][j] === 0) {
          tAvailableCells.push({ i, j });
        }
      }
    }
    return tAvailableCells;
  }
  /**
   * Gestion de l'evenement onKeyUp
   * @param {*} e event onKeyUp
   */
  handleKeyUp(e) {
    if (!e.keyCode || e.keyCode < 37 || e.keyCode > 40) {
      return;
    } else if (e.keyCode === 37) {
      // On fait un clique gauche
      this.genericKeyClick(false, false);
    } else if (e.keyCode === 38) {
      // On fait un clique haut
      this.genericKeyClick(true, true);
    } else if (e.keyCode === 39) {
      // On fait un clique droit
      this.genericKeyClick(false, true);
    } else {
      // On fait un clique bas
      this.genericKeyClick(true, false);
    }
  }
  /**
   * Lorsqu'on clique sur une fleche alors on déplace les elements de la grille
   * @param {boolean} withRotate Nous faisons une rotation de tGrid lors du keyUp et keyDown
   * afin de traiter la grille comme un keyRight/keyLeft
   * @param {boolean} reverseMerge true: On fait le merge en fin de tableau, sinon en début
   */
  genericKeyClick(withRotate = false, reverseMerge = false) {
    const { tGrid } = this.state;
    if (withRotate) {
      this.rotate(tGrid);
    }
    const tNewGrid = [];
    for (let i = 0; i < this.nbSquareGrid; i++) {
      const line = tGrid[i];
      const tValues = line.filter(value => value > 0);
      tNewGrid.push(Array(this.nbSquareGrid).fill(0));
      if (tValues.length === 0) continue;
      this.mergeValues(tValues, reverseMerge);
      if (reverseMerge) {
        // On ajoute les valeurs à la fin du tableau
        tNewGrid[i].splice(this.nbSquareGrid - tValues.length);
        tNewGrid[i].push(...tValues);
      } else {
        // On supprime tValue.length case en partant de la fin
        tNewGrid[i].splice(-tValues.length);
        // On ajoute les valeurs au début du tableau
        tNewGrid[i].unshift(...tValues);
      }
    }
    if (this.gridHasMoved(tGrid, tNewGrid)) {
      this.insertValue(tNewGrid);
    }
    if (withRotate) {
      //On unrotate la grille tNewGrid
      this.rotate(tNewGrid, false);
    }
    this.setState({ tGrid: tNewGrid });
  }

  /**
   * Permet de tourner la grille de 90° dans le sens horaire ou anti-horaire si clockwise = false
   * @param {array} tGrid tableau représentant la grille de jeu que nous allons rotate
   * @param {boolean} clockwise si true: sens horaire, si false: sens anti-horaire
   */
  rotate(tGrid, clockwise = true) {
    if (clockwise) {
      tGrid = tGrid.reverse();
    } else {
      tGrid = tGrid.map(row => row.reverse());
    }
    for (let i = 0; i < tGrid.length; i++) {
      for (let j = 0; j < i; j++) {
        const temp = tGrid[i][j];
        tGrid[i][j] = tGrid[j][i];
        tGrid[j][i] = temp;
      }
    }
  }

  /**
   * Permet de fusionner les valeurs indentiques
   * @param {array} tValues tableau des valeurs d'une ligne/colonne
   * @param {boolean} reverse utilisé lors du keyRight et du keyUp (ayant subit rotate 90 ce qui revient a un keyRight)
   */
  mergeValues(tValues, reverse = false) {
    if (reverse) {
      // On itére sur les tValues en partant de la fin et
      // en multipliant par 2 le nombre tValues[i] si tValues[i] === tValues[i - 1]
      for (let i = tValues.length - 1; i > 0; i--) {
        if (tValues[i] && tValues[i] === tValues[i - 1]) {
          tValues[i] *= 2;
          tValues.splice(i - 1, 1); // Suppression de tValues[i - 1]
          i--; // On enléve 1 a i car nous avons supprimé une case du tableau
        }
      }
    } else {
      // On itére sur les tValues en partant du début et
      // en multipliant par 2 le nombre tValues[i] si tValues[i] === tValues[i + 1]
      for (let j = 0; j < tValues.length - 1; j++) {
        if (tValues[j + 1] && tValues[j] === tValues[j + 1]) {
          tValues[j] *= 2;
          tValues.splice(j + 1, 1);
        }
      }
    }
  }
  /**
   * Permet de comparer l'ancienne grille et la nouvelle grille. Si rien n'a changé alors
   * on n'insere pas de nouvelle valeur
   * @param {array} tGrid ancienne grille de jeu
   * @param {array} tNewGrid nouvelle grille de jeu avec déplacement effectué
   * @returns {boolean}
   */
  gridHasMoved(tGrid, tNewGrid) {
    let hasMoved = false;
    let i = 0;
    while (i < this.nbSquareGrid && !hasMoved) {
      const strGrid = tGrid[i].join("");
      const strNewGrid = tNewGrid[i].join("");
      if (strGrid !== strNewGrid) hasMoved = true;
      i++;
    }
    return hasMoved;
  }
  render() {
    const { tGrid } = this.state;
    return (
      <div className="App" onKeyUp={this.handleKeyUp}>
        <table>
          <tbody>
            {[...Array(this.nbSquareGrid)].map((e, i) => (
              <tr
                id={i}
                key={`${i}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`}
              >
                {[...Array(this.nbSquareGrid)].map((e, j) => {
                  const value = tGrid[i][j] || "";
                  const styleCell = value ? `cell-${value}` : "";
                  return (
                    <td
                      id={`${i}-${j}`}
                      key={`${j}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`}
                      className={`cell ${styleCell}`}
                    >
                      <span>{value}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
