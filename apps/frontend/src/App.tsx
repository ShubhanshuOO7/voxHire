
import "../styles/globals.css"
import Form from "./components/Form";
import {Toaster} from "./components/ui/sonner"
import { BrowserRouter,Routes,Route } from "react-router-dom";
import  Interview  from "./components/Interview";
import { Result } from "./components/Result";
export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/Form" element={<Form/>}/>
          <Route path="/interview" element={<Interview/>}/>
          <Route path="/Result" element={<Result/>}/>
        </Routes>
      </BrowserRouter>
       <Toaster position="bottom-left"/>
    </div>
  );
}

export default App;
