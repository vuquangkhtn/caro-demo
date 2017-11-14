import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	var className = "square";
	if(props.isBold == true) {
		className = "squareBold";
	}
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(row,col) {
    return (
      <Square
        value={this.props.squares[row][col]}
        onClick={() => this.props.onClick(row,col)}
        isBold = {this.props.isHighlight[row][col]}
      />
    );
  }

  render() {
    return (
      <div>
      {this.props.squares.map((square, indexRow) => (
        <div className="board-row">
          {this.props.squares[indexRow].map((square, indexCol) => (
	          this.renderSquare(indexRow,indexCol)
	        ))}
      	</div>
        ))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [
        {
          squares: Array(5).fill(null).map(x => Array(5).fill(null)),
          curRow: -1,
          curCol: -1
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  createDefaultHighlightBoard(row,col) {
    return Array(row).fill(false).map(x => Array(col).fill(false));
  }

  handleClick(row,col) {
    //reset ui listMoves
    var listBtn = document.getElementsByName("btnMoves");
    for (var i = listBtn.length - 1; i >= 0; i--) {
      listBtn[i].className = "btn";
    }

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map(x => x.slice());
    if (calculateWinner(squares) || squares[row][col]) {
      return;
    }
    squares[row][col] = this.state.xIsNext ? "X" : "O";
    // console.log(this.state.history);
    // throw new Error("Something went badly wrong!");
    this.setState({
      history: history.concat([
        {
          squares: squares,
          curRow: row,
          curCol: col
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  sortBtnMoves() {
    var toSort = document.getElementById('list').children;
    toSort = Array.prototype.slice.call(toSort, 0);

    // toSort.reverse();

    var aParsed = parseInt(toSort[0].id);
    var bParsed = parseInt(toSort[1].id);
    var isAcsending = aParsed>bParsed;

    toSort.sort(function(a,b){
      var aParsed = parseInt(a.id);
      var bParsed = parseInt(b.id);
      return isAcsending? (aParsed - bParsed):(bParsed - aParsed);
    })

    var parent = document.getElementById('list');
    parent.innerHTML = "";

    for(var i = 0, l = toSort.length; i < l; i++) {
        parent.appendChild(toSort[i]);
    }
  }

  createBoard() {
    // var arr = [];
    var rows = parseInt(document.getElementById('rows').value);
    var cols = parseInt(document.getElementById('cols').value);
    if(rows < 5 || cols < 5 || !rows || !cols) {
      alert("rows or cols must not be smaller than 5");
      return;
    }
    // arr = Array(rows).fill(null).map(x => Array(cols).fill(null));

    this.setState({
      history: [
        {
          squares: Array(rows).fill(null).map(x => Array(cols).fill(null)),
          curRow: -1,
          curCol: -1
        }
      ],
      stepNumber: 0,
      xIsNext: true
    });
  }

  jumpTo(step) {
    var listBtn = document.getElementsByName("btnMoves");
    for (var i = listBtn.length - 1; i >= 0; i--) {
      listBtn[i].className = "btn";
    }

    var btnClicked = document.getElementById("btn"+step);
    btnClicked.className = "btn-clicked";
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const isHighlight = this.createDefaultHighlightBoard(current.squares.length, current.squares[0].length);

    const moves = history.map((step, move) => {
      const curStep = history[move];
      const curPos = curStep.curRow+":"+curStep.curCol;
        const desc ='Go to move #' + move;
        return (
          <div key={move} id={move} >
            <button className ="btn" name="btnMoves" id={"btn"+move} onClick={() => this.jumpTo(move)}>
            {desc}
            <div>Pos {curPos}</div>
            </button>
            <br/>
          </div>
        );
    });

    let status;
    if (winner) {
      for (var i = winner.length - 1; i >= 0; i--) {
        isHighlight[winner[i].i][winner[i].j] = true;
      }
      status = "Winner: " + current.squares[winner[0].i][winner[0].j];

    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");

      if(current.curRow != -1 && current.curCol != -1) {
        isHighlight[current.curRow][current.curCol] = true;
      }
    }

    return (

      <div className="game">
        <div className="create-board">
          <label>
            Rows: <input type="text" id="rows"/>
          </label>
          <label>
            Columns: <input type="text" id="cols"/>
          </label>
          <button onClick={() => this.createBoard()}>Create Board</button>
        </div>
        <div className="game-board">
          
          <Board
            squares={current.squares}
            onClick={(row,col) => this.handleClick(row,col)}
            isHighlight = {isHighlight}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.sortBtnMoves()}>Toggle sort</button>
          <ol id="list">{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  var maxRows = squares.length;
  var maxCols = squares[0].length;

  for (let i=0;i<maxRows;i++) {
    for(let j=0;j<maxCols;j++) {
      if(squares[i][j]) {
        if (i < squares.length-4
          && squares[i][j] === squares[i+1][j] 
          && squares[i][j] === squares[i+2][j]
          && squares[i][j] === squares[i+3][j] 
          && squares[i][j] === squares[i+4][j]) {
          return [ 
            {
              i:i,
              j:j
            },
            {
              i:i+1,
              j:j
            },
            {
              i:i+2,
              j:j
            },
            {
              i:i+3,
              j:j
            },
            {
              i:i+4,
              j:j
            }
          ];
        } 
        else if(j < squares[0].length-4 
          && squares[i][j] 
          && squares[i][j] === squares[i][j+1] 
          && squares[i][j] === squares[i][j+2]
          && squares[i][j] === squares[i][j+3] 
          && squares[i][j] === squares[i][j+4]) {
          return [ 
            {
              i:i,
              j:j
            },
            {
              i:i,
              j:j+1
            },
            {
              i:i,
              j:j+2
            },
            {
              i:i,
              j:j+3
            },
            {
              i:i,
              j:j+4
            }
          ];
        }
        else if(i < squares.length-4 
          && j < squares[0].length-4 
          && squares[i][j] 
          && squares[i][j] === squares[i+1][j+1] 
          && squares[i][j] === squares[i+2][j+2]
          && squares[i][j] === squares[i+3][j+3] 
          && squares[i][j] === squares[i+4][j+4]) {
          return [ 
            {
              i:i,
              j:j
            },
            {
              i:i+1,
              j:j+1
            },
            {
              i:i+2,
              j:j+2
            },
            {
              i:i+3,
              j:j+3
            },
            {
              i:i+4,
              j:j+4
            }
          ];
        }
        else if(i < squares.length-4 
          && j >= 4 
          && squares[i][j] 
          && squares[i][j] === squares[i+1][j-1] 
          && squares[i][j] === squares[i+2][j-2]
          && squares[i][j] === squares[i+3][j-3] 
          && squares[i][j] === squares[i+4][j-4]) {
          return [ 
            {
              i:i,
              j:j
            },
            {
              i:i+1,
              j:j-1
            },
            {
              i:i+2,
              j:j-2
            },
            {
              i:i+3,
              j:j-3
            },
            {
              i:i+4,
              j:j-4
            }
          ];
        }
      }
    }
  }  
  return null;
}
