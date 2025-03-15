import {
  createContext,
  useContext,
  useReducer,
  PropsWithChildren,
  Dispatch,
} from "react";
import { DEFAULT_WORD_LENGTH, QWERTY_KEYBOARD } from "./Constants";

if (!Array.prototype.removeInPlace) {
  Array.prototype.removeInPlace = function <T>(
    predicate: (element: T) => boolean
  ): void {
    for (let i = this.length - 1; i >= 0; i--) {
      if (predicate(this[i])) {
        this.splice(i, 1);
      }
    }
  };
}

type Constraint =
  | { kind: "absent" }
  | { kind: "atLeast"; count: number }
  | { kind: "exactly"; count: number };

export type KeyState = {
  strikethrough: boolean;
};

export function defaultKeyState(): KeyState {
  return { strikethrough: false };
}

type State = {
  keyboard: string[][];
  wordLength: number;
  constraints: Map<string, Constraint[]>;
};

export function deriveKeyStates(
  keyboard: string[][],
  input: Map<string, Constraint[]>
): Map<string, KeyState> {
  return new Map<string, KeyState>(
    keyboard.flat().map((key) => {
      const constraints = input.get(key) ?? defaultKeyConstraints();

      const strikethrough = constraints.some((c) => c.kind === "absent");

      return [key, { strikethrough }];
    })
  );
}

function createAppState(wordLength: number, keyboard: string[][]): State {
  const constraints = new Map(
    keyboard.flat().map((l) => [l, defaultKeyConstraints()])
  );

  return {
    wordLength,
    keyboard,
    constraints,
  };
}

function defaultKeyConstraints(): Constraint[] {
  return [{ kind: "absent" }];
}

function defaultAppState(): State {
  return createAppState(DEFAULT_WORD_LENGTH, QWERTY_KEYBOARD);
}

function reducer(currentState: State, key: string): State {
  const nextState = structuredClone(currentState);

  const letterConstraints = nextState.constraints.get(key) ?? [];

  const isAbsent = letterConstraints.some((c) => c.kind === "absent");

  switch (isAbsent) {
    case true: {
      letterConstraints.removeInPlace((c) => c.kind === "absent");
      letterConstraints.push({ kind: "atLeast", count: 1 });
      break;
    }
    case false: {
      letterConstraints.removeInPlace(
        (c) => c.kind === "atLeast" || c.kind === "exactly"
      );
      letterConstraints.push({ kind: "absent" });
      break;
    }
  }

  nextState.constraints.set(key, letterConstraints);

  return nextState;
}

const AppStateContext = createContext<State>(defaultAppState());
const AppDispatchContext = createContext<Dispatch<string>>((action: string) => {
  console.error(`dispatch wiring issue: ${action}`);
});

export function StateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, defaultAppState());

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
