"use client";

import { useReducer } from "react";
import { AppState, appStateReducer, defaultAppState } from "../AppState";
import { Keyboard } from "./components/index";

function Title() {
  return <h1 className="text-5xl m-2">brutle</h1>;
}

function InputDisplay({ state }: { state: AppState }) {
  const { constraints } = state;

  const visualization = JSON.stringify(Array.from(constraints.entries()));

  return <p>{visualization}</p>;
}

function WordDisplay() {
  return <></>;
}

export default function Home() {
  const [state, dispatch] = useReducer(appStateReducer, defaultAppState());

  return (
    <>
      <Title />
      <div className="grow">
        <InputDisplay state={state} />
        <WordDisplay />
      </div>
      <Keyboard state={state} dispatch={dispatch} />
    </>
  );
}
