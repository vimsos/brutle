"use client";

import {
  defaultKeyState,
  StateProvider,
  useAppDispatch,
  useAppState,
} from "../AppStateContext";

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

function Keyboard() {
  const { keyboard } = useAppState();
  return (
    <div className="m-2">
      {keyboard.map((row, index) => {
        return (
          <div key={`kb-row-${index}`} className="flex justify-center">
            {row.map((letter) => (
              <Key key={`kb-row-${letter}`} letter={letter} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Key({ letter }: { letter: string }) {
  const { strikethrough } =
    useAppState().keyStates.get(letter) ?? defaultKeyState();
  const dispatch = useAppDispatch();

  return (
    <div
      className={
        "text-2xl border-1 min-h-8 min-w-8 rounded m-1 items-center justify-center"
      }
      onClick={() => {
        dispatch(letter);
      }}
    >
      <p>{strikethrough ? <s>{letter}</s> : letter}</p>
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
