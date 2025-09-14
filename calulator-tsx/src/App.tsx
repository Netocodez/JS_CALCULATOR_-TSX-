import React, { useEffect, useState } from "react";

// Calculator built to satisfy FreeCodeCamp calculator project user stories.
// Export default React component so it can be previewed / dropped into an app.

export default function Calculator() {
  const [display, setDisplay] = useState<string>("0");
  const [expr, setExpr] = useState<string>(""); // internal expression string, tokens like "5+3*2"
  const [lastPressed, setLastPressed] = useState<string>(""); // track last pressed button
  const [evaluated, setEvaluated] = useState<boolean>(false); // whether last action was =

  // Helper: determine if a character is an operator
  const isOperator = (ch: string) => ["+", "-", "*", "/"].includes(ch);

  // Update display helper (keeps display trimmed and readable)
  const formatNumber = (n: number) => {
    // Keep reasonable precision (10 decimal places), trim trailing zeros
    const fixed = parseFloat(n.toFixed(10));
    return String(fixed);
  };

  // Shunting-yard algorithm to evaluate expression safely
  const evaluateExpression = (input: string): number => {
    try {
      // Tokenize numbers (including decimals) and operators
      const tokens: string[] = [];
      let numBuf = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if ((ch >= "0" && ch <= "9") || ch === ".") {
          numBuf += ch;
        } else if (isOperator(ch)) {
          if (numBuf !== "") {
            tokens.push(numBuf);
            numBuf = "";
          }
          // Handle unary negative: if '-' and it's at start or previous token is an operator
          if (ch === "-") {
            const prev = tokens.length ? tokens[tokens.length - 1] : null;
            if (!prev || isOperator(prev)) {
              // unary minus: append to next number buffer as a sign
              numBuf = "-";
              continue;
            }
          }
          tokens.push(ch);
        }
      }
      if (numBuf !== "") tokens.push(numBuf);

      // Convert to RPN
      const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
      const outputQueue: string[] = [];
      const opStack: string[] = [];

      for (const t of tokens) {
        if (isOperator(t)) {
          while (
            opStack.length > 0 &&
            isOperator(opStack[opStack.length - 1]) &&
            prec[opStack[opStack.length - 1]] >= prec[t]
          ) {
            outputQueue.push(opStack.pop() as string);
          }
          opStack.push(t);
        } else {
          // number
          outputQueue.push(t);
        }
      }
      while (opStack.length) outputQueue.push(opStack.pop() as string);

      // Evaluate RPN
      const stack: number[] = [];
      for (const token of outputQueue) {
        if (isOperator(token)) {
          const b = stack.pop();
          const a = stack.pop();
          if (a === undefined || b === undefined) return NaN;
          let res = 0;
          if (token === "+") res = a + b;
          if (token === "-") res = a - b;
          if (token === "*") res = a * b;
          if (token === "/") res = a / b;
          stack.push(res);
        } else {
          // parse number
          stack.push(parseFloat(token));
        }
      }
      if (stack.length !== 1) return NaN;
      return stack[0];
    } catch (e) {
      return NaN;
    }
  };

  // When a numeric button is clicked
  const handleNumber = (digit: string) => {
    setLastPressed(digit);

    // If the last action was evaluation and the user presses a number, start fresh
    if (evaluated) {
      setExpr(digit === "0" ? "" : digit);
      setDisplay(digit);
      setEvaluated(false);
      return;
    }

    // If expression is empty
    if (expr === "") {
      // prevent multiple leading zeros
      if (digit === "0") {
        // if display already 0 do nothing
        if (display === "0") {
          setDisplay("0");
          return;
        }
        setExpr("0");
        setDisplay("0");
        return;
      }
      setExpr(digit);
      setDisplay(digit);
      return;
    }

    // If last token is an operator, append digit as new number
    const lastChar = expr[expr.length - 1];
    if (isOperator(lastChar)) {
      // new number
      setExpr(expr + digit);
      setDisplay(digit);
      return;
    }

    // We're continuing a number — prevent multiple leading zeros like "00"
    // Find start of current number
    let i = expr.length - 1;
    while (i >= 0 && !isOperator(expr[i])) i--;
    const current = expr.substring(i + 1);
    if (current === "0") {
      // replace single leading zero
      const newExpr = expr.slice(0, i + 1) + digit;
      setExpr(newExpr);
      setDisplay(digit);
      return;
    }

    // otherwise append
    setExpr(expr + digit);
    setDisplay((prev) => (prev === "0" ? digit : prev + digit));
  };

  // Decimal
  const handleDecimal = () => {
    setLastPressed(".");
    // If just evaluated, start new number as "0."
    if (evaluated) {
      setExpr("0.");
      setDisplay("0.");
      setEvaluated(false);
      return;
    }

    if (expr === "") {
      setExpr("0.");
      setDisplay("0.");
      return;
    }

    // Find current number
    let i = expr.length - 1;
    while (i >= 0 && !isOperator(expr[i])) i--;
    const current = expr.substring(i + 1);
    if (current.includes(".")) return; // don't allow second decimal in number

    // If last char is operator, start new number with 0.
    const lastChar = expr[expr.length - 1];
    if (isOperator(lastChar)) {
      setExpr(expr + "0.");
      setDisplay("0.");
      return;
    }

    setExpr(expr + ".");
    setDisplay((prev) => prev + ".");
  };

  // Operator handling
  const handleOperator = (op: string) => {
    setLastPressed(op);
    // If just evaluated, start new expression with previous result
    if (evaluated) {
      // keep display as the result and append operator to expr
      setExpr(display + op);
      setEvaluated(false);
      return;
    }

    if (expr === "") {
      // only allow unary minus at start
      if (op === "-") {
        setExpr("-");
        setDisplay("-");
      }
      // else ignore leading operator
      return;
    }

    const lastChar = expr[expr.length - 1];

    if (isOperator(lastChar)) {
      // If user enters two or more operators consecutively, use last operator (except allow negative sign)
      // Special case: if last operator is not '-' and the new operator is '-' then treat as unary negative
      if (op === "-" && lastChar !== "-") {
        // allow sequence like "5* -" to become "5*-" so next number becomes negative
        setExpr(expr + "-");
        setDisplay("-");
        return;
      }

      // Otherwise replace trailing operators with the new one
      // Remove trailing operators
      let base = expr;
      while (base.length && isOperator(base[base.length - 1]))
        base = base.slice(0, -1);
      setExpr(base + op);
      return;
    }

    // Normal append
    setExpr(expr + op);
    setDisplay(op);
  };

  // Clear
  const handleClear = () => {
    setDisplay("0");
    setExpr("");
    setLastPressed("");
    setEvaluated(false);
  };

  // Equals
  const handleEquals = () => {
    if (!expr) return;
    // Remove trailing operators
    let safeExpr = expr;
    while (safeExpr.length && isOperator(safeExpr[safeExpr.length - 1])) {
      safeExpr = safeExpr.slice(0, -1);
    }
    if (!safeExpr) return;
    const result = evaluateExpression(safeExpr);
    if (isNaN(result) || !isFinite(result)) {
      setDisplay("Error");
      setExpr("");
      setEvaluated(true);
      return;
    }
    const out = formatNumber(result);
    setDisplay(out);
    setExpr(out); // store result as starting expression
    setEvaluated(true);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key;
      if (k >= "0" && k <= "9") handleNumber(k);
      if (k === ".") handleDecimal();
      if (k === "+") handleOperator("+");
      if (k === "-") handleOperator("-");
      if (k === "*") handleOperator("*");
      if (k === "/") handleOperator("/");
      if (k === "Enter" || k === "=") {
        e.preventDefault();
        handleEquals();
      }
      if (k === "Escape") handleClear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, display, evaluated]);

  // Buttons layout
  const numButtons = [
    { id: "seven", label: "7" },
    { id: "eight", label: "8" },
    { id: "nine", label: "9" },
    { id: "four", label: "4" },
    { id: "five", label: "5" },
    { id: "six", label: "6" },
    { id: "one", label: "1" },
    { id: "two", label: "2" },
    { id: "three", label: "3" },
    { id: "zero", label: "0" },
  ];

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient"
      style={{ padding: 20 }}
    >
      <div className="card shadow p-3" style={{ width: 360 }}>
        <h3 className="text-center mb-2">Calculator</h3>
        <div
          id="display"
          className="bg-dark text-light p-3 rounded mb-3"
          style={{ fontSize: 24, minHeight: 56 }}
        >
          {display}
        </div>

        <div className="d-flex gap-2 mb-2">
          <button
            id="clear"
            className="btn btn-danger flex-grow-1"
            onClick={handleClear}
          >
            AC
          </button>
          <button
            id="divide"
            className="btn btn-secondary"
            onClick={() => handleOperator("/")}
          >
            ÷
          </button>
          <button
            id="multiply"
            className="btn btn-secondary"
            onClick={() => handleOperator("*")}
          >
            ×
          </button>
        </div>

        <div
          className="d-grid gap-2"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {numButtons.slice(0, 9).map((b) => (
            <button
              key={b.id}
              id={b.id}
              className="btn btn-light m-1"
              style={{ width: 100 }}
              onClick={() => handleNumber(b.label)}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="d-flex gap-2 mt-2">
          <button
            id="add"
            className="btn btn-primary flex-grow-1"
            onClick={() => handleOperator("+")}
          >
            +
          </button>
          <button
            id="subtract"
            className="btn btn-primary flex-grow-1"
            onClick={() => handleOperator("-")}
          >
            -
          </button>
          <button
            id="decimal"
            className="btn btn-outline-dark"
            onClick={handleDecimal}
          >
            .
          </button>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            id="equals"
            className="btn btn-success flex-grow-1"
            onClick={handleEquals}
          >
            =
          </button>
          <button
            id="zero"
            className="btn btn-light flex-grow-1"
            onClick={() => handleNumber("0")}
          >
            0
          </button>
        </div>

        <div className="small text-muted mt-3">Expression: {expr || "—"}</div>
      </div>
    </div>
  );
}
