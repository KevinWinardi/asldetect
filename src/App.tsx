import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { DetectionPage } from "./pages/DetectionPage";
import { TrainingPage } from "./pages/TrainingPage";
import { DatasetPage } from "./pages/DatasetPage";
import { HomePage } from "./pages/HomePage";
import { SettingPage } from "./pages/SettingPage";

export function App() {
    return (
        <>
            <Header></Header>

            <main className="min-h-dvh bg-gray-100 overflow-hidden">
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/detection" element={<DetectionPage />}></Route>
                    <Route path="/training" element={<TrainingPage />}></Route>
                    <Route path="/dataset" element={<DatasetPage />}></Route>
                    <Route path="/setting" element={<SettingPage />}></Route>
                </Routes>
            </main>

            <Footer></Footer>
        </>
    );
}