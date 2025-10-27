import React from "react";

export function Tooltip({
    text = "",
    html = null,
}: {
    text?: string;
    html?: React.ReactNode;
}) {
    return (
        <div className="relative flex justify-center items-center ml-4 group">
            <i className="fa-solid fa-circle-info text-xl text-blue-500"></i>

            <div
                className="
                    absolute bottom-full mb-3 right-0
                    z-50 w-max max-w-[70vw] sm:max-w-xs
                    p-3 text-sm text-white bg-black rounded-sm shadow-lg
                    opacity-0 invisible transition-all duration-300
                    group-hover:opacity-100 group-hover:visible
                "
            >
                {html ? html : <p>{text}</p>}

                <div
                    className="
                        absolute top-full right-1
                        w-0 h-0
                        border-l-6 border-r-6 border-t-6
                        border-l-transparent border-r-transparent border-t-black
                    "
                />
            </div>
        </div>
    );
}
