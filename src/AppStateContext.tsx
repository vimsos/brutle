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

export type Constraint =
  | { kind: "absent" }
  | { kind: "atLeast"; count: number }
  | { kind: "exactly"; count: number };

type AppState = {
  keyboard: string[][];
  wordLength: number;
  constraints: Map<string, Constraint[]>;
};

function createAppState(wordLength: number, keyboard: string[][]): AppState {
  const constraints = new Map(
    keyboard.flat().map((l) => [l, defaultLetterConstraints()])
  );

  return {
    wordLength,
    keyboard,
    constraints,
  };
}

export function defaultLetterConstraints(): Constraint[] {
  return [{ kind: "absent" }];
}

function defaultAppState(): AppState {
  return createAppState(DEFAULT_WORD_LENGTH, QWERTY_KEYBOARD);
}

function handleLetterPressed(
  state: AppState,
  { letter }: LetterPressedAction
): void {
  const constraints =
    state.constraints.get(letter) ?? defaultLetterConstraints();

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

function handleLetterUp(state: AppState, { letter }: LetterUpAction): void {
  const constraints =
    state.constraints.get(letter) ?? defaultLetterConstraints();

  const countConstraint = constraints.find(
    (c) => c.kind === "atLeast" || c.kind === "exactly"
  );

  if (countConstraint === undefined) return;

  countConstraint.count =
    countConstraint.count + 1 > state.wordLength
      ? state.wordLength
      : countConstraint.count + 1;
}

function handleLetterLock(state: AppState, { letter }: LetterLockAction): void {
  const constraints =
    state.constraints.get(letter) ?? defaultLetterConstraints();

  const countConstraint = constraints.find(
    (c) => c.kind === "atLeast" || c.kind === "exactly"
  );

  if (countConstraint === undefined) return;

  countConstraint.kind =
    countConstraint.kind === "atLeast" ? "exactly" : "atLeast";
}

function reducer(currentState: AppState, action: Action): AppState {
  const nextState = structuredClone(currentState);

  if (action.kind === "letter") handleLetterPressed(nextState, action);
  if (action.kind === "up") handleLetterUp(nextState, action);
  if (action.kind === "lock") handleLetterLock(nextState, action);

  return nextState;
}

const AppStateContext = createContext<AppState>(defaultAppState());
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
