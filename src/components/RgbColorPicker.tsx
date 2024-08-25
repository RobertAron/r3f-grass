type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

// const commonLabelClasses =
//   "h-6 w-6 rounded-full p-2 ring-offset-2 data-[selected=true]:ring-2 ";
export type RGB = {
  r: number;
  g: number;
  b: number;
};
export function RGBTHing({
  color,
  setColor,
}: {
  color: RGB;
  setColor: SetState<RGB>;
}) {
  const { r, g, b } = color;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-32 w-32"
        style={{ background: `rgb(${r * 255},${g * 255},${b * 255})` }}
      />
      <div>
        <div className="flex flex-col">
          <label htmlFor="red-part">Red (width)</label>
          <input
            id="red-part"
            type="range"
            min={0}
            max={1}
            step={1 / 255}
            value={color.r}
            onChange={(event) =>
              setColor((curr) => ({
                ...curr,
                r: Number(event.target.value),
              }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="green-part">Green (height)</label>
          <input
            id="green-part"
            type="range"
            min={0}
            max={1}
            step={1 / 255}
            value={color.g}
            onChange={(event) =>
              setColor((curr) => ({
                ...curr,
                g: Number(event.target.value),
              }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="blue-part">Blue (depth)</label>
          <input
            id="blue-part"
            type="range"
            min={0}
            max={1}
            step={1 / 255}
            value={color.b}
            onChange={(event) =>
              setColor((curr) => ({
                ...curr,
                b: Number(event.target.value),
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
