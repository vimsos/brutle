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

type LetterPressedAction = { kind: "letter"; letter: string };
type LetterUpAction = { kind: "up"; letter: string };
type LetterLockAction = { kind: "lock"; letter: string };
export type Action = LetterPressedAction | LetterUpAction | LetterLockAction;

type Constraint =
  | { kind: "absent" }
  | { kind: "atLeast"; count: number }
  | { kind: "exactly"; count: number };

export type KeyState = {
  strikethrough: boolean;
  count: number;
  locked: boolean;
};

export function defaultKeyState(): KeyState {
  return { strikethrough: true, count: 0, locked: false };
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
      const countConstraint = constraints.find(
        (c) => c.kind === "atLeast" || c.kind === "exactly"
      );
      const count = countConstraint === undefined ? 0 : countConstraint.count;
      const locked = countConstraint?.kind === "exactly";

      return [key, { strikethrough, count, locked }];
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

function handleLetterPressed(
  state: State,
  { letter }: LetterPressedAction
): void {
  const constraints = state.constraints.get(letter) ?? defaultKeyConstraints();

  const isAbsent = constraints.some((c) => c.kind === "absent");

  switch (isAbsent) {
    case true: {
      constraints.removeInPlace((c) => c.kind === "absent");
      constraints.push({ kind: "atLeast", count: 1 });
      break;
    }
    case false: {
      constraints.removeInPlace(
        (c) => c.kind === "atLeast" || c.kind === "exactly"
      );
      constraints.push({ kind: "absent" });
      break;
    }
  }

  state.constraints.set(letter, constraints);
}

function handleLetterUp(state: State, { letter }: LetterUpAction): void {
  const constraints = state.constraints.get(letter) ?? defaultKeyConstraints();

  const countConstraint = constraints.find(
    (c) => c.kind === "atLeast" || c.kind === "exactly"
  );

  if (countConstraint === undefined) return;

  countConstraint.count =
    countConstraint.count + 1 > state.wordLength
      ? state.wordLength
      : countConstraint.count + 1;
}

function handleLetterLock(state: State, { letter }: LetterLockAction): void {
  const constraints = state.constraints.get(letter) ?? defaultKeyConstraints();

  const countConstraint = constraints.find(
    (c) => c.kind === "atLeast" || c.kind === "exactly"
  );

  if (countConstraint === undefined) return;

  countConstraint.kind =
    countConstraint.kind === "atLeast" ? "exactly" : "atLeast";
}

function reducer(currentState: State, action: Action): State {
  const nextState = structuredClone(currentState);

  if (action.kind === "letter") handleLetterPressed(nextState, action);
  if (action.kind === "up") handleLetterUp(nextState, action);
  if (action.kind === "lock") handleLetterLock(nextState, action);

  return nextState;
}

const AppStateContext = createContext<State>(defaultAppState());
const AppDispatchContext = createContext<Dispatch<Action>>((action: Action) => {
  console.error(`dispatch wiring issue: ${JSON.stringify(action)}`);
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
