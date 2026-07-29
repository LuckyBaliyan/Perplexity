import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
      name: "theme",
      initialState: {
            value: localStorage.getItem("theme") || "dark",
      },
      reducers: {
            toggleTheme: (state) => {
                  state.value = state.value === "dark" ? "light" : "dark";
                  localStorage.setItem("theme", state.value); // keep it in sync here too
            },
      },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;