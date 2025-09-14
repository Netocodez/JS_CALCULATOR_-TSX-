
# React TypeScript Calculator

This is a React + TypeScript calculator component built to satisfy the freeCodeCamp JavaScript Calculator project.

It implements a fully functional calculator with keyboard support, expression parsing, proper operator precedence, decimals, and error handling.


## Features

- React functional component with Hooks
- useState for display, expression, last pressed button, evaluation state.
- useEffect for global keyboard event support.
- Safe expression evaluation using a custom shunting-yard algorithm (no eval()).
- Operator precedence: * and / before + and -.
- Decimal handling: prevents multiple decimals in the same number.
- Negative numbers: supports unary minus.
- Keyboard shortcuts: 0–9, ., +, -, *, /, Enter/=, Escape.
- Bootstrap layout with grid and flex utilities.


## Usage/Examples

### 1. Install React and Bootstrap (if you haven’t already):

```
npm install react react-dom bootstrap

```

### 2. Include the component:
```
import Calculator from "./Calculator";

function App() {
  return <Calculator />;
}

export default App;

```

### 3. Run the app:
```
npm start

```

### 4. Use the on-screen buttons or your keyboard to perform calculations.


## File Structure
```
src/
 └─ Calculator.tsx   # The calculator component

```


## Component Props

This calculator has no props; it’s self-contained. All state is internal.
## UI Layout

- Top display area shows the current input or result.

- Buttons arranged in rows:

- AC (clear), ÷, ×
- Numbers 7–9, 4–6, 1–3
- +, -, .
- =, 0

- Expression preview at the bottom (for debugging).
## Calculation Logic

### Input Handling:

- handleNumber adds digits to the expression while preventing invalid leading zeros.

- handleDecimal inserts a decimal point only if the current number has none.

- handleOperator appends operators, collapses multiple operators, and allows unary minus.

- handleEquals evaluates the current expression safely.

- handleClear resets everything.

### Evaluation:

- evaluateExpression tokenizes the string, converts to Reverse Polish Notation (RPN), then computes the result using a stack.

- This avoids using JavaScript eval() and correctly handles precedence and negatives.
## App Logic Explanation (Plain English)

### State Variables

- display: what the user sees on screen.

- expr: the full expression string used internally to calculate.

- lastPressed: remembers the last button pressed (useful for edge cases).

- evaluated: whether the last action was pressing =.

### Number Input (handleNumber)

- If you’ve just calculated a result, start a new expression.

- Prevent multiple leading zeros.

- If you’re after an operator, start a new number.

- Otherwise, append the digit to the current number.

### Decimal (handleDecimal)

- If just evaluated, start with 0..

- If current number already has ., ignore.

- If last char is an operator, insert 0. after it.

- Else append ..

### Operators (handleOperator)

- If just evaluated, start a new expression with the result plus operator.

- If at the start, only allow unary minus.

- If last char is operator:

- Allow a minus sign after another operator (unary minus).

- Otherwise replace the trailing operator with the new one.

- Else append normally.

### Equals (handleEquals)

- Remove trailing operators (they cause errors).

- Evaluate the expression with a safe shunting-yard + RPN stack algorithm.

- Show the result in display and also store it in expr (so you can continue calculating).

### Clear (handleClear)

- Reset everything to initial state.

- Keyboard Support (useEffect)

- Listens for keydown events and maps keys to the same handlers as the buttons.

### UI Layout

- Buttons laid out in rows with Bootstrap classes.

- A display area shows the current value.

- A debug “Expression” line shows the raw expr string.

This gives you a fully self-contained calculator component that behaves like a real pocket calculator and passes the freeCodeCamp user stories.
## Keyboard Support

| Key            | Action        |
| -------------- | ------------- |
| `0–9`          | Input digit   |
| `.`            | Decimal point |
| `+ - * /`      | Operator      |
| `Enter` or `=` | Calculate     |
| `Escape`       | Clear (AC)    |

## License

[MIT](https://choosealicense.com/licenses/mit/)

