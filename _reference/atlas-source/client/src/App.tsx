import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ScrollManager from "./components/ScrollManager";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteLayout from "./components/SiteLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Awards from "./pages/Awards";
import CityHub from "./pages/CityHub";
import Cities from "./pages/Cities";
import Collaboration from "./pages/Collaboration";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";
import Corporate from "./pages/Corporate";
import Home from "./pages/Home";
import InsightDetail from "./pages/InsightDetail";
import Insights from "./pages/Insights";
import MyShortlists from "./pages/MyShortlists";
import Operators from "./pages/Operators";
import Privacy from "./pages/Privacy";
import Property from "./pages/Property";
import Resources from "./pages/Resources";
import Search from "./pages/Search";
import SharedShortlist from "./pages/SharedShortlist";
import Terms from "./pages/Terms";
import AdminPortal from "./pages/AdminPortal";

function Router() {
  return (
    <Switch>
      <Route path={"/admin"} component={AdminPortal} />
      <Route>
        <SiteLayout>
          <ScrollManager />
          <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/cities"} component={Cities} />
        <Route path={"/cities/:slug"} component={CityHub} />
        <Route path={"/properties/:slug"} component={Property} />
        <Route path={"/search"} component={Search} />
        <Route path={"/collections"} component={Collections} />
        <Route path={"/awards"} component={Awards} />
        <Route path={"/resources"} component={Resources} />
        <Route path={"/insights"} component={Insights} />
        <Route path={"/insights/:slug"} component={InsightDetail} />
        <Route path={"/corporate"} component={Corporate} />
        <Route path={"/collaboration"} component={Collaboration} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/operators"} component={Operators} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/account/shortlists"} component={MyShortlists} />
        <Route path={"/s/:token"} component={SharedShortlist} />
        <Route path={"/404"} component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </SiteLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
