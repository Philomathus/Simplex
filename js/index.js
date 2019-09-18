/***************************************************************************************
* An implementation of the fraction data type.                                         *
* Fraction is the best data type for the simplex algorithm for maintained accuracy.    *  		 									      *
***************************************************************************************/
class Fraction {
    
    constructor(numerator, denominator) {
        if(this.denominator == 0)
            throw "The denominator cannot be zero.";
        
        this.numerator = numerator;
        this.denominator = denominator;
        this.simplify();
    }
    
    getNumerator() {
        return this.numerator;
    }
    
    getDenominator() {
        return this.denominator;
    }
    
    add(addend) {
        let lcm = Fraction.lcm(this.denominator, addend.denominator); 
        
        let sum = new Fraction(lcm * this.numerator/this.denominator + lcm * addend.numerator/addend.denominator, lcm);
        sum.simplify();
        
        return sum;
    }
    
    subtract(subtrahend) {
        let lcm = Fraction.lcm(this.denominator, subtrahend.denominator); 
        
        let difference = new Fraction(lcm * this.numerator/this.denominator - lcm * subtrahend.numerator/subtrahend.denominator, lcm);
        difference.simplify();
        
        return difference;
    }
    
    multiply(multiplier) {
        let product = new Fraction(this.numerator * multiplier.numerator, this.denominator * multiplier.denominator);
        product.simplify();
        return product;
    }
    
    divide(divisor) {
        let quotient = new Fraction(this.numerator * divisor.denominator, this.denominator * divisor.numerator);
        quotient.simplify();
        return quotient;
    }

    static gcf(a, b) {
        if(b > a) {
            let tmp = a;
            a = b;
            b = tmp;
        }
        
        let r;
        while(b != 0) {
            r = a%b;
            a = b;
            b = r;
        }
        
        return a;
    }
    
    static lcm(a, b) {
        return a * b / Fraction.gcf(a, b);
    }
    
    simplify() {
        let gcf = Fraction.gcf(this.numerator, this.denominator);
        this.numerator /= gcf;
        this.denominator /= gcf;
        
        if(this.denominator < 0) {
            this.denominator *= -1;
            this.numerator *= -1;
        }
    }
    
    toDouble() {
        return this.numerator/this.denominator;
    }

    toString() {
        let str = this.numerator + "";
        
        if(this.denominator != 1)
            str += "/" + this.denominator;
        
        return str;
    }
    
    static parseFraction(str) {
        if((/^-?\d+\/-?\d+$/).test(str)) {
            let n_d = str.split("/");
            return new Fraction(parseInt(n_d[0]), parseInt(n_d[1]));
        } else if((/^-?\d+$/).test(str)) 
            return new Fraction(parseInt(str), 1);
        else if((/^-?\d+\.\d+$/).test(str)) 
            return new Fraction(parseInt(str.replace('.', '')), 10 ** (str.length - str.indexOf('.') - 1));
        else
            throw 'The argument is not a numeric string.'; 
    }
}

/***************************************************************************************
* A wrapper class for the tableau of the simplex algorithm.                            *
* The current implementation does not detect cycling.                                  *
* Validity checking of the argument tableau is delegated to the logic that uses it.    *
***************************************************************************************/

class Simplex {
    
    constructor(tableau) {
        this.tableau = tableau;
    }
    
    getIndexOfPivotColumn() {
        let objectiveRow = this.tableau[this.tableau.length-1]; 
        let ipc = -1;
        
        let tmp;
        for(let j = objectiveRow.length - this.tableau.length, i = j - 1; i > 0; --i) {
            tmp = objectiveRow[i].toDouble();
            if(tmp < 0 && tmp < objectiveRow[j].toDouble())
                ipc = j = i;
        }
        
        if(ipc == -1)
            throw 'There is no pivot column.';
        
        return ipc;
    }
    
    getIndexOfPivotRow() {
        let ipc = this.getIndexOfPivotColumn();
    
        let	ipr = -1;
        
        let testRatio = Number.MAX_VALUE, 
            tmp;
        
        for(let i = this.tableau.length - 2, indexOfRHS = this.tableau[0].length - 1; i > 0; --i) {
            
            try {
                tmp = this.tableau[i][indexOfRHS].toDouble() / this.tableau[i][ipc].toDouble();
            } catch(divByZero) {
                tmp = 0;
            }
            
            if(0 < tmp && tmp < testRatio) {
                ipr = i;
                testRatio = tmp;
            }
                
        }

        if(ipr == -1)
            throw 'There is no pivot row.';
        
        return ipr;
    }
    
    pivot() {
        let ipc = this.getIndexOfPivotColumn(),
            ipr = this.getIndexOfPivotRow();
        
        this.tableau[ipr][0] = this.tableau[0][ipc];
        
        let pivotElement = this.tableau[ipr][ipc];
        
        for(let i = 1; i < this.tableau[ipr].length; ++i)
            this.tableau[ipr][i] = this.tableau[ipr][i].divide(pivotElement);
        
        let m;
        for(let i = 1, j; i < this.tableau.length; ++i)
            if(i != ipr) {       
                m = Object.assign({}, this.tableau[i][ipc]);
                for(j = 1; j < this.tableau[i].length; ++j)
                    this.tableau[i][j] = this.tableau[i][j].subtract(this.tableau[ipr][j].multiply(m)); 
                    
            }
        
        return this.tableau;
    }
    
    isOptimal() {
        let objectiveRow = this.tableau[this.tableau.length-1];
        
        for(let i = 1; i < objectiveRow.length; ++i)
            if(objectiveRow[i].getNumerator() < 0)
                return false;
        
        return true;
    }
    
    getDecision() {
        if(this.isOptimal()) {
            
            let decision = {};
            
            for(let i = 1, indexOfRHS = this.tableau[0].length - 1; i < this.tableau.length; ++i) 
                decision[this.tableau[i][0]] = this.tableau[i][indexOfRHS]; 
            
            for(let i = this.tableau[0].length - 2; i > 0; --i)
                if(decision[this.tableau[0][i]] === undefined) 
                    decision[this.tableau[0][i]] = 0;
            
            return decision;
            
        }
        
        throw 'The tableau is not optimal. Hence, there is no decision.';
    }
    
}

/***************************************************************************************
* An IO utility class for the tableau of the simplex algorithm.                        *
***************************************************************************************/

class IO {

    constructor() {
        throw 'IO is a utility class. Hence, instantiation is absurd.';
    }

    static generateTableauFrom(coefficientMatrixString) {

        let tableau = [[]];

        let sarrRows = coefficientMatrixString.trim().split('\n');

        if(sarrRows.length < 2)
            throw 'The minimum dimension of a valid coefficient matrix is 2x5.';

        for(let row of sarrRows) {
            let newRow = [null];

            for(let cell of row.trim().split(/ +/))
                newRow.push(Fraction.parseFraction(cell));

            if(newRow.length < 6 || tableau.length > 1 && tableau[1].length != newRow.length)
                throw 'The minimum dimension of a valid coefficient matrix is 2x5.';

            tableau.push(newRow);
        }

        tableau[0].push('BV');
        
        for(let i = 1, startOfBV = tableau[1].length - tableau.length, lim = tableau[1].length - 3; i <= lim; ++i)
            tableau[0].push(i < startOfBV ? `x<sub>${i}</sub>` : `s<sub>${i - startOfBV + 1}</sub>`);
        
        tableau[0].push('P');
        tableau[0].push('RHS');

        for(let i = tableau.length - 2; i > 0; --i)
            tableau[i][0] = `s<sub>${i}</sub>`;

        tableau[tableau.length-1][0] = 'P';

        return tableau;
    }

    static generateHTMLTableFrom(tableau) {
        let HTMLtable = '<table>';

        for(let row of tableau) {
            HTMLtable += '<tr>';

            for(let cell of row)
                HTMLtable += `<td>${cell.toString()}</td>`;

            HTMLtable += '</tr>';

        }

        return HTMLtable + '</table>';
    }

} 

const txtInput = document.getElementById('txtInput'),
        secOutput = document.querySelector('#secOutput'),
        btnMenu = document.querySelector('#btnMenu'),
        settings = document.querySelector('.settings'),
        rngInputFontSize = document.querySelector('#rngInputFontSize'),
        rngOutputFontSize = document.querySelector('#rngOutputFontSize'),
        cboAlignment = document.querySelector('#cboAlignment');

function adjust() {
    const comp = window.getComputedStyle(txtInput, null);
    txtInput.style.width = comp.minWidth;
    txtInput.style.width = txtInput.scrollWidth + 'px';
    txtInput.style.height = comp.minHeight;
    txtInput.style.height = txtInput.scrollHeight +'px';
}

btnMenu.addEventListener('click', () => {
    btnMenu.classList.toggle('change');
    settings.classList.toggle('show');
});

rngInputFontSize.addEventListener('change', () => {
    txtInput.style.fontSize = rngInputFontSize.value + 'px';
    adjust();
});

rngOutputFontSize.addEventListener('change', () => {
    secOutput.style.fontSize = rngOutputFontSize.value + 'px';
});

cboAlignment.addEventListener('change', () => secOutput.firstElementChild.style.textAlign = cboAlignment.options[cboAlignment.selectedIndex].text);

txtInput.addEventListener('input', adjust);

document.querySelector('#btnSolve').addEventListener('click', () => {

    try {

        let output = '<div><hr id="separator">';

        let simplex = new Simplex(IO.generateTableauFrom(txtInput.value));

        for(let i = 1; true; ++i) {

            output += `<h3>Tableau ${i}</h3>` + IO.generateHTMLTableFrom(simplex.tableau);
            
            if(simplex.isOptimal()) 
                break;
            else 
                simplex.pivot();
                
        }

        let decision = simplex.getDecision();

        output += '<h3>Decision</h3>';

        for(let v in decision)
            output += `${v} = ${decision[v]}<br>`;
        
        secOutput.innerHTML = output + '</div>';

    } catch(err) {
        alert(err);
    }

});

document.querySelector('#btnExport').addEventListener('click', () => window.print());
