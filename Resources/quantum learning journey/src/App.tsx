import { AnimatePresence, motion } from "framer-motion";
import { CalcProvider, useCalc } from "./state/store";
import { Shell } from "./components/Shell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConsoleView } from "./views/ConsoleView";
import { WindingView } from "./views/WindingView";
import { TheoryView } from "./views/TheoryView";
import { Derivation } from "./components/Derivation";
import { Playground } from "./components/Playground";
import { ConvexWorlds } from "./components/ConvexWorlds";
import { ClassicalGame } from "./components/ClassicalGame";
import { PolytopeView } from "./views/PolytopeView";
import { CHSHView } from "./views/CHSHView";
import { HierarchyView } from "./views/HierarchyView";

function Router() {
  const { view } = useCalc();

  const page = () => {
    switch (view) {
      case "console": return <ConsoleView />;
      case "winding": return <WindingView />;
      case "derivation": return <Derivation />;
      case "playground": return <Playground />;
      case "polytope": return <PolytopeView />;
      case "convexity": return <ConvexWorlds />;
      case "chsh": return <CHSHView />;
      case "hierarchy": return <HierarchyView />;
      case "classical": return <ClassicalGame />;
      case "theory": return <TheoryView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        <ErrorBoundary>
          {page()}
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <CalcProvider>
      <Shell>
        <Router />
      </Shell>
    </CalcProvider>
  );
}
