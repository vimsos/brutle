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
type SelectPositionAction = { kind: "select"; position: number };
export type Action =
  | LetterPressedAction
  | LetterUpAction
  | LetterLockAction
  | SelectPositionAction;

export type Constraint =
  | { kind: "absent" }
  | { kind: "atLeast"; count: number }
  | { kind: "exactly"; count: number }
  | { kind: "presentAt"; index: number }
  | { kind: "absentAt"; index: number };

export type AppState = {
  keyboard: string[][];
  wordLength: number;
  selected?: number;
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

export function defaultAppState(): AppState {
  return createAppState(DEFAULT_WORD_LENGTH, QWERTY_KEYBOARD);
}

function handleLetterPressed(
  state: AppState,
  { letter }: LetterPressedAction
): void {
  const constraints =
    state.constraints.get(letter) ?? defaultLetterConstraints();

  if (state.selected === undefined) {
    const isAbsent = constraints.some((c) => c.kind === "absent");

    if (isAbsent) {
      constraints.removeInPlace((c) => c.kind === "absent");
      constraints.push({ kind: "atLeast", count: 1 });
    } else {
      constraints.removeInPlace(
        (c) =>
          c.kind === "atLeast" ||
          c.kind === "exactly" ||
          c.kind === "presentAt" ||
          c.kind === "absentAt"
      );
      constraints.push({ kind: "absent" });
    }
  } else {
    const constraintIndex = state.selected % state.wordLength;
    const presenceConstraint = constraints.find(
      (c) =>
        (c.kind === "presentAt" || c.kind === "absentAt") &&
        c.index == constraintIndex
    );

    if (presenceConstraint === undefined) {
      constraints.removeInPlace((c) => c.kind === "absent");
      constraints.push({ kind: "presentAt", index: constraintIndex });
    } else if (presenceConstraint.kind === "presentAt") {
      constraints.removeInPlace(
        (c) => c.kind === "presentAt" || c.kind === "absent"
      );
      constraints.push({ kind: "absentAt", index: constraintIndex });
    } else if (presenceConstraint.kind === "absentAt") {
      constraints.removeInPlace((c) => c.kind === "absentAt");
      constraints.push({ kind: "absent" });
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

function handleSelectPosition(
  state: AppState,
  { position }: SelectPositionAction
): void {
  state.selected = state.selected === undefined ? position : undefined;
}

export function appStateReducer(
  currentState: AppState,
  action: Action
): AppState {
  const nextState = structuredClone(currentState);

  if (action.kind === "letter") handleLetterPressed(nextState, action);
  else if (action.kind === "up") handleLetterUp(nextState, action);
  else if (action.kind === "lock") handleLetterLock(nextState, action);
  else if (action.kind === "select") handleSelectPosition(nextState, action);

  return nextState;
}
