import { Link } from "react-router-dom";
import { useState } from "react";

export function Header() {
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <header className="fixed top-0 left-0 z-50 flex justify-between items-center w-full px-8 py-4 shadow-md bg-white">
            <section className="flex-[2]">
                <span className="text-2xl font-bold">
                    ASL Detection
                </span>
            </section>

            <section className="hidden sm:flex flex-[3] justify-between items-center">
                <div>
                    <nav>
                        <ul className="flex gap-8 font-semibold">
                            <li><Link to='/' className="block transition duration-500 hover:underline underline-offset-4 hover:opacity-75 hover:scale-90">Home</Link></li>
                            <li><Link to='/detection' className="block transition duration-500 hover:underline underline-offset-4 hover:opacity-75 hover:scale-90">Detection</Link></li>
                            <li><Link to='/dataset' className="block transition duration-500 hover:underline underline-offset-4 hover:opacity-75 hover:scale-90">Dataset</Link></li>
                            <li><Link to='/training' className="block transition duration-500 hover:underline underline-offset-4 hover:opacity-75 hover:scale-90">Training</Link></li>
                        </ul>
                    </nav>
                </div>

                <div>
                    <Link
                        to='/setting'
                        className="block p-2 text-white bg-blue-500 font-semibold rounded-md transition hover:opacity-75 hover:scale-90 cursor-pointer"
                        onClick={() => setOpenMenu(false)}
                    >
                        <i className="fa-solid fa-gear"></i> Setting
                    </Link>
                </div>
            </section>

            {/* Mobile phone */}
            <button className="block sm:hidden p-2 text-2xl cursor-pointer transition hover:scale-90 hover:opacity-75" onClick={() => setOpenMenu(!openMenu)}><i className="fa-solid fa-bars"></i></button>

            <section className={`absolute sm:hidden top-full left-0 w-full bg-white border-t shadow-md origin-top transition duration-300 ease-in-out 
                ${openMenu ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
            `}>
                <nav>
                    <ul className="flex flex-col font-bold">
                        <li>
                            <Link
                                to="/"
                                className="block p-4 hover:bg-blue-500 hover:text-white transition"
                                onClick={() => setOpenMenu(false)}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/detection"
                                className="block p-4 hover:bg-blue-500 hover:text-white transition"
                                onClick={() => setOpenMenu(false)}
                            >
                                Detection
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/dataset"
                                className="block p-4 hover:bg-blue-500 hover:text-white transition"
                                onClick={() => setOpenMenu(false)}
                            >
                                Dataset
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/training"
                                className="block p-4 hover:bg-blue-500 hover:text-white transition"
                                onClick={() => setOpenMenu(false)}
                            >
                                Training
                            </Link>
                        </li>
                    </ul>
                </nav>

                <Link
                    to={'/setting'}
                    className="block w-max m-4 p-2 text-white bg-blue-500 font-semibold rounded-md transition hover:opacity-75 hover:scale-90 cursor-pointer"
                    onClick={() => setOpenMenu(false)}
                >
                    <i className="fa-solid fa-right-to-bracket"></i> Setting
                </Link>
            </section>
        </header>
    );
}