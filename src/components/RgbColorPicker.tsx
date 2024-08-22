type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

const commonLabelClasses =
  "h-6 w-6 rounded-full p-2 ring-offset-2 data-[selected=true]:ring-2 ";
export type RGB = "red" | "green" | "blue";
export function RGBTHing({
  color,
  setColor,
}: {
  color: RGB;
  setColor: SetState<RGB>;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        className="appearance-none"
        type="radio"
        id="red-button"
        name="color-picker"
        value="red"
        checked={color === "red"}
        onChange={() => setColor("red")}
      />
      <label
        className={`${commonLabelClasses} bg-red-500 data-[selected=true]:ring-red-500`}
        htmlFor="red-button"
        data-selected={`${color === "red"}`}
      />
      <input
        className="appearance-none"
        type="radio"
        id="green-button"
        name="color-picker"
        value="green"
        checked={color === "blue"}
        onChange={() => setColor("blue")}
      />
      <label
        className={`${commonLabelClasses} bg-blue-500 data-[selected=true]:ring-blue-500`}
        htmlFor="green-button"
        data-selected={`${color === "blue"}`}
      />
      <input
        className="appearance-none"
        type="radio"
        id="blue-button"
        name="color-picker"
        value="blue"
        checked={color === "green"}
        onChange={() => setColor("green")}
      />
      <label
        className={`${commonLabelClasses} bg-green-500 data-[selected=true]:ring-green-500`}
        htmlFor="blue-button"
        data-selected={`${color === "green"}`}
      />
    </div>
  );
}
