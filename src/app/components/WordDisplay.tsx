import { Action, AppState } from "@/AppState";
import { Dispatch } from "react";

function deriveState(input: AppState): {
  selected: boolean;
  letter: string;
}[] {
  return Array<{
    selected: boolean;
    letter: string;
  }>(input.wordLength)
    .fill({
      selected: false,
      letter: "*",
    })
    .map((state, index) => {
      const letter =
        Array.from(input.constraints.entries()).find((entry) =>
          entry[1].some((c) => c.kind === "presentAt" && c.index === index)
        )?.[0] ?? "*";
      const selected = input.selected === index;

      return {
        selected,
        letter,
      };
    });
}

export function WordDisplay({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<Action>;
}) {
  const derived = deriveState(state);

  return (
    <div className="flex grow justify-center items-center text-center">
      {derived.map((position, positionIndex) => {
        const backgroundColor = position.selected ? "bg-blue-900" : "";
        return (
          <div className="flex" key={`display-pos-${positionIndex}`}>
            <p
              className={`m-2 flex min-h-12 min-w-12 border-1 rounded ${backgroundColor}`}
              key={`display-pos-${positionIndex}`}
              onClick={() =>
                dispatch({
                  kind: "select",
                  position: positionIndex,
                })
              }
            >
              {position.letter}
            </p>
          </div>
        );
      })}
    </div>
  );
}
