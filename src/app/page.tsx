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
          <div key={`kb-row-${index}`} className="flex justify-center p-0.5">
            {row.map((letter) => {
              const keyState = keyStates.get(letter) ?? defaultKeyState();
              return (
                <Key key={`kb-${letter}`} letter={letter} keyState={keyState} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Key({ letter, keyState }: { letter: string; keyState: KeyState }) {
  const { strikethrough, count, locked } = keyState;
  const dispatch = useAppDispatch();

  return (
    <div
      className={
        "m-0.5 text-2xl border-1 min-h-8 min-w-16 rounded flex justify-between"
      }
    >
      <p
        className="grow"
        onClick={() => {
          dispatch({ kind: "letter", letter });
        }}
      >
        {strikethrough ? <s>{letter}</s> : letter}
      </p>
      <div className="flex flex-col min-h-4 min-w-4 text-sm justify-end border-l-1">
        <p
          onClick={() => {
            dispatch({ kind: "up", letter });
          }}
        >
          {count}
        </p>
        <p
          onClick={() => {
            dispatch({ kind: "lock", letter });
          }}
        >
          {locked ? "T" : "F"}
        </p>
      </div>
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
