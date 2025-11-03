import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <div className="w-full min-h-dvh flex flex-col justify-center items-center pt-16 bg-gradient-to-b from-blue-400 to-blue-700">
            <h1 className="text-6xl font-bold text-white">Welcome to ASL Detection</h1>

            <Link to={'/detection'} className="mt-12 p-4 text-2xl text-blue-900 bg-white font-bold border rounded-full shadow-2xl animate-bounce cursor-pointer
                transition duration-500 hover:bg-orange-400 hover:text-white
            ">
                Start detection
            </Link>
        </div>
    );
}