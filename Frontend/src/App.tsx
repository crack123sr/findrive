import AppRoutes from "./routes/index.tsx";
import { ThemeProvider } from "./context/theme-provider.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;