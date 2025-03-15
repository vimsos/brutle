"use client";

import {
  defaultKeyState,
  deriveKeyStates,
  KeyState,
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
  const { keyboard, constraints } = useAppState();
  const keyStates = deriveKeyStates(keyboard, constraints);

  return (
    <div className="m-2">
      {keyboard.map((row, index) => {
        return (
          <div key={`kb-row-${index}`} className="flex justify-center">
            {row.map((letter) => {
              const keyState = keyStates.get(letter) ?? defaultKeyState();
              return (
                <Key
                  key={`kb-row-${letter}`}
                  letter={letter}
                  keyState={keyState}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Key({ letter, keyState }: { letter: string; keyState: KeyState }) {
  const { strikethrough } = keyState;
  const dispatch = useAppDispatch();

  return (
    <div
      className={
        "text-2xl border-1 min-h-8 min-w-8 rounded m-1 items-center justify-center"
      }
      onClick={() => {
        dispatch({ kind: "letterPressed", letter });
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
