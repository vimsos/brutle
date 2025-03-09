"use client";

import { StateProvider, useAppDispatch, useAppState } from "../AppStateContext";

function Title() {
  return <h1 className="text-5xl m-2">brutle</h1>;
}

function InputDisplay() {
  const { wordLength, constraints } = useAppState();
  return <>{JSON.stringify({ wordLength, constraints })}</>;
}

function WordDisplay() {
  return <></>;
}

function Keyboard() {
  const { keyboardRows } = useAppState();
  return (
    <div className="m-2">
      {keyboardRows.map((letters, index) => {
        return (
          <div key={`row-${index}`} className="flex justify-center">
            {letters.map((l) => (
              <Key key={l} letter={l} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Key({ letter }: { letter: string }) {
  const dispatch = useAppDispatch();
  return (
    <div
      className="text-2xl border-1 min-h-8 min-w-8 rounded m-1 items-center justify-center"
      onClick={() => {
        dispatch(letter);
      }}
    >
      {letter}
    </div>
  );
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
