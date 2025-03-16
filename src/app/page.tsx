"use client";

import { StateProvider, useAppState } from "../AppStateContext";
import { Keyboard } from "./components/index";

function Title() {
  return <h1 className="text-5xl m-2">brutle</h1>;
}

function InputDisplay() {
  const { constraints } = useAppState();
  const visualization = JSON.stringify(Array.from(constraints.entries()));
  return <p>{visualization}</p>;
}

function WordDisplay() {
  return <></>;
}

export default function Home() {
  return (
    <StateProvider>
      <Title />
      <div className="grow">
        <InputDisplay />
        <WordDisplay />
      </div>
      <Keyboard />
    </StateProvider>
  );
}
