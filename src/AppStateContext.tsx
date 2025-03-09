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

type Constraint = { kind: "absent" };

type KeyState = {
  strikethrough: boolean;
};

export function defaultKeyState(): KeyState {
  return { strikethrough: false };
}

type State = {
  keyboard: string[][];
  wordLength: number;
  constraints: Map<string, Constraint[]>;
  keyStates: Map<string, KeyState>;
};

function defaultAppState(): State {
  return {
    wordLength: DEFAULT_WORD_LENGTH,
    keyboard: QWERTY_KEYBOARD,
    constraints: new Map(),
    keyStates: new Map(),
  };
}

function reducer(currentState: State, key: string): State {
  const nextState = structuredClone(currentState);

  const letterConstraints = nextState.constraints.get(key) ?? [];
  const keyState = nextState.keyStates.get(key) ?? defaultKeyState();

  const isAbsent = letterConstraints.some((c) => c.kind === "absent");

  switch (isAbsent) {
    case false: {
      letterConstraints.push({ kind: "absent" });
      keyState.strikethrough = true;
      break;
    }
    case true: {
      letterConstraints.removeInPlace((c) => c.kind === "absent");
      keyState.strikethrough = false;
      break;
    }
  }

  nextState.constraints.set(key, letterConstraints);
  nextState.keyStates.set(key, keyState);

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
