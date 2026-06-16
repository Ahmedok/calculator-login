import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Operator = "+" | "-" | "×" | "÷";

interface CalcState {
  display: string;
  prevValue: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
}

const initialState: CalcState = {
  display: "0",
  prevValue: null,
  operator: null,
  waitingForOperand: false,
};

function applyOperator(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b !== 0 ? a / b : NaN;
  }
}

function formatResult(n: number): string {
  if (isNaN(n)) return "Error";
  // Avoid floating point noise like 0.1 + 0.2 = 0.30000000000000004
  const rounded = parseFloat(n.toFixed(10));
  return String(rounded);
}

export default function CalculatorPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<CalcState>(initialState);

  const handleDigit = (digit: string) => {
    setState((s) => ({
      ...s,
      display: s.waitingForOperand
        ? digit
        : s.display === "0"
          ? digit
          : s.display + digit,
      waitingForOperand: false,
    }));
  };

  const handleDecimal = () => {
    setState((s) => {
      if (s.waitingForOperand)
        return { ...s, display: "0.", waitingForOperand: false };
      if (s.display.includes(".")) return s;
      return { ...s, display: s.display + "." };
    });
  };

  const handleOperator = (op: Operator) => {
    setState((s) => {
      const current = parseFloat(s.display);
      if (s.prevValue !== null && !s.waitingForOperand) {
        const result = applyOperator(s.prevValue, current, s.operator!);
        return {
          display: formatResult(result),
          prevValue: result,
          operator: op,
          waitingForOperand: true,
        };
      }
      return {
        ...s,
        prevValue: current,
        operator: op,
        waitingForOperand: true,
      };
    });
  };

  const handleEquals = () => {
    setState((s) => {
      if (s.prevValue === null || s.operator === null) return s;
      const result = applyOperator(
        s.prevValue,
        parseFloat(s.display),
        s.operator,
      );
      return {
        display: formatResult(result),
        prevValue: null,
        operator: null,
        waitingForOperand: true,
      };
    });
  };

  const handleClear = () => setState(initialState);

  const handleToggleSign = () =>
    setState((s) => ({
      ...s,
      display: formatResult(parseFloat(s.display) * -1),
    }));

  const handlePercent = () =>
    setState((s) => ({
      ...s,
      display: formatResult(parseFloat(s.display) / 100),
    }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  type ButtonDef = {
    label: string;
    action: () => void;
    variant: "function" | "operator" | "digit";
    wide?: boolean;
  };

  const buttons: ButtonDef[] = [
    { label: "C", action: handleClear, variant: "function" },
    { label: "+/-", action: handleToggleSign, variant: "function" },
    { label: "%", action: handlePercent, variant: "function" },
    { label: "÷", action: () => handleOperator("÷"), variant: "operator" },
    { label: "7", action: () => handleDigit("7"), variant: "digit" },
    { label: "8", action: () => handleDigit("8"), variant: "digit" },
    { label: "9", action: () => handleDigit("9"), variant: "digit" },
    { label: "×", action: () => handleOperator("×"), variant: "operator" },
    { label: "4", action: () => handleDigit("4"), variant: "digit" },
    { label: "5", action: () => handleDigit("5"), variant: "digit" },
    { label: "6", action: () => handleDigit("6"), variant: "digit" },
    { label: "-", action: () => handleOperator("-"), variant: "operator" },
    { label: "1", action: () => handleDigit("1"), variant: "digit" },
    { label: "2", action: () => handleDigit("2"), variant: "digit" },
    { label: "3", action: () => handleDigit("3"), variant: "digit" },
    { label: "+", action: () => handleOperator("+"), variant: "operator" },
    {
      label: "0",
      action: () => handleDigit("0"),
      variant: "digit",
      wide: true,
    },
    { label: ".", action: handleDecimal, variant: "digit" },
    { label: "=", action: handleEquals, variant: "operator" },
  ];

  const variantClass: Record<ButtonDef["variant"], string> = {
    function: "bg-gray-400 hover:bg-gray-300 text-black",
    operator: "bg-orange-500 hover:bg-orange-400 text-white",
    digit: "bg-gray-700 hover:bg-gray-600 text-white",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-gray-400 text-sm truncate max-w-45">
            {user}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors ml-2 shrink-0"
          >
            Logout
          </button>
        </div>

        {/* Calculator body */}
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl p-5">
          {/* Display */}
          <div className="text-right mb-4 px-2">
            <div className="text-gray-500 text-sm h-5 font-light">
              {state.prevValue !== null
                ? `${state.prevValue} ${state.operator ?? ""}`
                : "\u00A0"}
            </div>
            <div
              className="text-white font-light overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                fontSize: state.display.length > 12 ? "1.6rem" : "3rem",
                lineHeight: 1.1,
              }}
            >
              {state.display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2.5">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`
                  ${variantClass[btn.variant]}
                  ${btn.wide ? "col-span-2 rounded-full! px-6 text-left" : "aspect-square rounded-full"}
                  text-xl font-medium transition-all active:scale-95 flex items-center
                  ${btn.wide ? "justify-start" : "justify-center"}
                `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
