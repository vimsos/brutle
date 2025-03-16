import {
  Action,
  AppState,
  Constraint,
  defaultLetterConstraints,
} from "@/AppState";
import { Dispatch } from "react";

type KeyState = {
  strikethrough: boolean;
  count: number;
  locked: boolean;
};

function defaultKeyState(): KeyState {
  return { strikethrough: true, count: 0, locked: false };
}

function deriveKeyStates(
  keyboard: string[][],
  input: Map<string, Constraint[]>
): Map<string, KeyState> {
  return new Map<string, KeyState>(
    keyboard.flat().map((key) => {
      const constraints = input.get(key) ?? defaultLetterConstraints();

      const strikethrough = constraints.some((c) => c.kind === "absent");
      const countConstraint = constraints.find(
        (c) => c.kind === "atLeast" || c.kind === "exactly"
      );
      const count = countConstraint === undefined ? 0 : countConstraint.count;
      const locked = countConstraint?.kind === "exactly";

      return [key, { strikethrough, count, locked }];
    })
  );
}

export function Keyboard({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<Action>;
}) {
  const { keyboard, constraints } = state;
  const keyStates = deriveKeyStates(keyboard, constraints);

  return (
    <div className="m-2">
      {keyboard.map((row, index) => {
        return (
          <div key={`kb-row-${index}`} className="flex justify-center p-0.5">
            {row.map((letter) => {
              const keyState = keyStates.get(letter) ?? defaultKeyState();
              return (
                <Key
                  key={`kb-${letter}`}
                  letter={letter}
                  keyState={keyState}
                  dispatch={dispatch}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Key({
  letter,
  keyState,
  dispatch,
}: {
  letter: string;
  keyState: KeyState;
  dispatch: Dispatch<Action>;
}) {
  const { strikethrough, count, locked } = keyState;

  return (
    <div
      className={
        "m-0.5 text-2xl border-1 min-h-8 min-w-16 rounded flex justify-between"
      }
    >
      <p
        className="grow"
        onClick={() => {
          dispatch({ kind: "letter", letter });
        }}
      >
        {strikethrough ? <s>{letter}</s> : letter}
      </p>
      <div className="flex flex-col min-h-4 min-w-4 text-sm justify-end border-l-1">
        <p
          onClick={() => {
            dispatch({ kind: "up", letter });
          }}
        >
          {count}
        </p>
        <p
          onClick={() => {
            dispatch({ kind: "lock", letter });
          }}
        >
          {locked ? "T" : "F"}
        </p>
      </div>
    </div>
  );
}
