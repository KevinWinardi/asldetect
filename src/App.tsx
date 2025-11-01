import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { DetectionPage } from "./pages/DetectionPage";
import { TrainingPage } from "./pages/TrainingPage";
import { DatasetPage } from "./pages/DatasetPage";
import { HomePage } from "./pages/HomePage";

export function App() {
    return (
        <>
            <Header></Header>

            <main className="min-h-dvh max-w-7xl block mx-auto px-4 sm:px-8 pt-24 pb-8 bg-gray-100">
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/detection" element={<DetectionPage />}></Route>
                    <Route path="/training" element={<TrainingPage />}></Route>
                    <Route path="/dataset" element={<DatasetPage />}></Route>
                </Routes>
            </main>

            <Footer></Footer>
        </>
    );
}