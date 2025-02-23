import { Box, Stack, Typography } from "@mui/material";
import { lazy, useEffect, useState } from "react";
import Loadable from "./Components/Lodable";
const ThemeChanger = Loadable(lazy(() => import('../src/Theme/ThemeChanger')));

function App() {

  return (
    <>
      <Stack justifyContent='center' alignItems='center' width='100vw'>
        <Typography variant="h6">Testing</Typography>
      </Stack>
      <Box>
        <ThemeChanger />
      </Box>
    </>
  );
}

export default App;
