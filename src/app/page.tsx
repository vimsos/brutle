"use client";

import { useReducer } from "react";
import { AppState, appStateReducer, defaultAppState } from "../AppState";
import { Keyboard, WordDisplay } from "./components/index";

function Title() {
  return <h1 className="text-5xl m-2">brutle</h1>;
}

function DebugDisplay({ state }: { state: AppState }) {
  const { constraints, wordLength, selected } = state;

  const constraintsJson = JSON.stringify(Array.from(constraints.entries()));
  const stateJson = JSON.stringify({ wordLength, selected });

  return (
    <div className="text-sm">
      <p>{constraintsJson}</p>
      <p>{stateJson}</p>
    </div>
  );
}

export default function Home() {
  const [state, dispatch] = useReducer(appStateReducer, defaultAppState());

  return (
    <>
      <Title />
      <div className="grow">
        <WordDisplay state={state} dispatch={dispatch} />
        <DebugDisplay state={state} />
      </div>
      <Keyboard state={state} dispatch={dispatch} />
    </>
  );
}
