import {
  createContext,
  useContext,
  useReducer,
  PropsWithChildren,
} from "react";
import { QWERTY_KEYBOARD } from "./Constants";

type Constraint = { key: string };

type State = {
  keyboardRows: string[][];
  wordLength: number;
  constraints: Constraint[];
};

export function defaultState(): State {
  return {
    wordLength: 5,
    constraints: [],
    keyboardRows: QWERTY_KEYBOARD,
  };
}

function reducer(currentState: State, action: string): State {
  switch (action) {
    default: {
      return {
        ...currentState,
        constraints: [...currentState.constraints, { key: action }],
      };
    }
  }
}

export const StateContext = createContext<State>(defaultState());
export const DispatchContext = createContext<React.Dispatch<string>>(
  (action: string) => {
    console.log("wiring issue", action);
  }
);

export function StateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, defaultState());

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}

export function useAppDispatch() {
  return useContext(DispatchContext);
}
